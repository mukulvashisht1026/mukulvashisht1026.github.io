/* Single data source: profile.js. DOM text is never parsed as HTML. */
'use strict';
const $ = selector => document.querySelector(selector);
const list = value => Array.isArray(value) ? value.filter(x => x && typeof x === 'object' && !Array.isArray(x)) : [];
const strings = value => Array.isArray(value) ? value.filter(x => typeof x === 'string' && x.trim()) : [];
const text = value => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
function el(tag, value = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text(value);
  if (className) node.className = className;
  return node;
}
function safeURL(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function externalLink(label, url) {
  const href = safeURL(url);
  if (!href) return null;
  const a = el('a', label || 'Visit');
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  return a;
}
function appendLinks(parent, values) {
  const container = el('div', '', 'card-links');
  list(values).forEach(item => { const a = externalLink(item.label, item.url); if (a) container.append(a); });
  if (container.childNodes.length) parent.append(container);
}
function section(id, values, make) {
  const root = $('#' + id);
  const container = root.querySelector('div');
  container.replaceChildren();
  values.forEach((value, i) => container.append(make(value, i)));
  root.hidden = values.length === 0;
}
function dateLabel(value) {
  const raw = text(value);
  if (!/^\d{4}(-\d{2})?(-\d{2})?$/.test(raw)) return raw;
  if (raw.length === 4) return raw;
  const date = new Date(raw.length === 7 ? raw + '-01T12:00:00Z' : raw + 'T12:00:00Z');
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleDateString('en', {year:'numeric', month:'short', ...(raw.length === 10 ? {day:'numeric'} : {}), timeZone:'UTC'});
}
function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('The JSON root must be an object.');
  if (data.schemaVersion !== 1) throw new Error('Use schemaVersion: 1.');
  if (!text(data.profile?.name).trim() || !text(data.profile?.role).trim()) throw new Error('profile.name and profile.role are required.');
  for (const key of ['skills','experience','projects','events','education','certifications']) {
    if (data[key] !== undefined && !Array.isArray(data[key])) throw new Error(key + ' must be an array.');
  }
  return data;
}
const mediaDisposers = [];
let mediaAutoplay = true;
const hoverPreviews = new Set();
document.addEventListener('visibilitychange', () => { if (document.hidden) hoverPreviews.forEach(video => video.pause()); });
let mediaDialog;
let modalDispose;
let modalOpener;
const assetVersion = Date.now();
function mediaURL(value) {
  const raw = text(value).trim();
  if (safeURL(raw)) return safeURL(raw);
  if (!raw || /[\\\u0000-\u001f]/.test(raw)) return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (!/^public\/[\w ./%@()+,\-]+$/i.test(decoded) || decoded.split('/').some(part => part === '..')) return null;
    return raw;
  } catch { return null; }
}
function freshAsset(value) {
  const url = mediaURL(value);
  return url && !/^https?:/i.test(url) ? url + '?v=' + assetVersion : url;
}
function makePhoto(base, name) {
  const frame = el('div', '', 'portrait');
  frame.setAttribute('role', 'img'); frame.setAttribute('aria-label', 'Portrait of ' + text(name));
  const initials = text(name).split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('');
  frame.append(el('span', initials, 'portrait-initials'));
  const source = text(base).trim();
  const hasExtension = /\.(jpe?g|png|webp|avif|gif|svg|heic|heif)$/i.test(source);
  const candidates = hasExtension ? [source] : ['jpg','jpeg','png','webp','avif','gif','heic','heif','svg'].map(ext => source + '.' + ext);
  const image = el('img'); image.alt = 'Photo of ' + text(name); image.hidden = true; image.width = 240; image.height = 280;
  let index=0;
  function next() {
    const url = freshAsset(candidates[index++]);
    if (url) image.src = url;
    else if (index < candidates.length) next();
  }
  image.addEventListener('load', () => { image.hidden = false; frame.classList.add('has-photo'); frame.removeAttribute('role'); frame.removeAttribute('aria-label'); });
  image.addEventListener('error', () => { image.hidden = true; if (index < candidates.length) next(); });
  frame.append(image); if (source) next();
  return frame;
}
function normalizeMedia(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.type === 'video') {
    const src = mediaURL(value.src);
    return src ? {type:'video', src, poster:mediaURL(value.poster)} : null;
  }
  if (value.type === 'images') {
    const items = strings(value.items).map(mediaURL).filter(Boolean);
    return items.length ? {type:'images', items, interval:Math.max(2000, Math.min(30000, Number(value.interval) || 4000))} : null;
  }
  return null;
}
function createMedia(raw, title, expanded = false, initialIndex = 0) {
  const media = normalizeMedia(raw);
  if (!media) return null;
  const root = el('div', '', 'media-viewer' + (expanded ? ' media-expanded' : ''));
  root.setAttribute('role', 'group'); root.setAttribute('aria-label', text(title) + ' media');
  const stage = el(expanded ? 'div' : 'button', '', 'media-stage');
  if (!expanded) { stage.type='button'; stage.setAttribute('aria-label', 'Open ' + text(title) + ' in a larger viewer'); }
  root.append(stage);
  let index = Math.max(0,Math.min(initialIndex,(media.items?.length || 1)-1));
  let hovered=false, focused=false, disposed=false;
  let timer;
  let transitionTimer;
  let video;
  let navigate = () => {};
  if (media.type === 'video') {
    video=el('video'); video.src=freshAsset(media.src); video.muted=!expanded; video.loop=true;
    video.autoplay=expanded; video.playsInline=true; video.controls=expanded; video.preload=expanded ? 'metadata' : 'none';
    if (media.poster) video.poster=freshAsset(media.poster);
    video.setAttribute('aria-label', text(title) + ' video');
    stage.append(video);
    if (!expanded) {
      const badge=el('span','▶ Hover to preview · Click to open','media-hint'); badge.setAttribute('aria-hidden','true'); stage.append(badge);
      hoverPreviews.add(video);
      stage.addEventListener('mouseenter', () => {
        if (window.matchMedia('(hover: hover)').matches && !document.hidden && !mediaDialog?.open) { video.muted = true; video.play().catch(() => {}); }
      });
      stage.addEventListener('mouseleave', () => video.pause());
      mediaDisposers.push(() => { hoverPreviews.delete(video); video.pause(); });
    }
    const error=el('p','This video could not be played. Check its file path and browser format support.','media-error'); error.hidden=true;
    video.addEventListener('error',()=>{error.hidden=false;}); root.append(error);
  } else {
    const track=el('div','','media-track');
    const count=media.items.length;
    const loop=count>1;
    const slides=loop ? [media.items[count-1],...media.items,media.items[0]] : media.items;
    slides.forEach((src,i)=>{
      const slide=el('div','','media-slide');
      const clone=loop && (i===0 || i===slides.length-1);
      const logical=loop ? (i-1+count)%count : i;
      slide.setAttribute('aria-hidden',String(clone || logical!==index));
      const image=el('img');image.src=freshAsset(src);image.alt=clone?'':text(title)+' — image '+(logical+1)+' of '+count;image.loading=expanded?'eager':'lazy';image.draggable=false;
      const unavailable=el('span','Image unavailable','media-error');unavailable.hidden=true;
      image.addEventListener('error',()=>{image.hidden=true;unavailable.hidden=false;});
      image.addEventListener('load',()=>{image.hidden=false;unavailable.hidden=true;});
      slide.append(image,unavailable);track.append(slide);
    });
    stage.append(track);
    let physical=loop ? index+1 : 0;
    function position(animate) {
      track.style.transition=animate?'':'none';
      track.style.transform='translate3d('+(-physical*100)+'%, 0, 0)';
      if(!animate){void track.offsetWidth;track.style.transition='';}
    }
    function settle() {
      clearTimeout(transitionTimer);
      if(loop && (physical===0 || physical===count+1)) {physical=index+1;position(false);}
    }
    track.addEventListener('transitionend',event=>{if(event.target===track && event.propertyName==='transform')settle();});
    position(false);
    if (!expanded) {const hint=el('span','↗ Expand','media-hint');hint.setAttribute('aria-hidden','true');stage.append(hint);}
    const controls=el('div','','media-controls');
    const counter=el('span','','media-count');counter.setAttribute('aria-live','off');
    const dots=el('div','','media-dots');
    const dotNodes=[];
    function show(nextIndex, animate=true) {
      settle();
      index=(nextIndex+count)%count;
      physical=loop ? (nextIndex<0 ? 0 : nextIndex>=count ? count+1 : index+1) : 0;
      position(animate);
      counter.textContent=(index+1)+' / '+count;
      dotNodes.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
      [...track.children].forEach((slide,i)=>slide.setAttribute('aria-hidden',String(loop ? i!==index+1 : i!==index)));
      if(animate && loop)transitionTimer=setTimeout(settle,650);
    }
    navigate=delta=>show(index+delta);
    function button(label, content, action) { const b=el('button',content);b.type='button';b.setAttribute('aria-label',label);b.addEventListener('click',action);return b; }
    if (media.items.length>1) {
      controls.append(button('Previous image','←',()=>navigate(-1)));
      media.items.forEach((_,i)=>{const dot=button('Show image '+(i+1),'',()=>show(i));dot.className='media-dot';dotNodes.push(dot);dots.append(dot);});
      controls.append(dots,button('Next image','→',()=>navigate(1)));

    }
    controls.append(counter);root.append(controls);show(index,false);
    if (media.items.length>1) timer=setInterval(()=>{
      if (!disposed && mediaAutoplay && (expanded || (!hovered && !focused)) && !document.hidden && (expanded || !mediaDialog?.open)) navigate(1);
    },media.interval);
  }
  root.addEventListener('mouseenter',()=>{hovered=true;}); root.addEventListener('mouseleave',()=>{hovered=false;});
  root.addEventListener('focusin',()=>{focused=true;});root.addEventListener('focusout',event=>{focused=root.contains(event.relatedTarget);});
  if (!expanded) stage.addEventListener('click',()=>openMedia(media,title,index,stage));
  const dispose=()=>{disposed=true;clearInterval(timer);clearTimeout(transitionTimer);if(video)video.pause();};
  if (!expanded) mediaDisposers.push(dispose);
  return {node:root,dispose,navigate};
}
function cleanupMedia() {
  modalDispose?.(); modalDispose = null;
  mediaDialog?.querySelector('.modal-content')?.replaceChildren();
  document.body.classList.remove('modal-open');
  modalOpener?.focus(); modalOpener = null;
}
function closeMedia() {
  if (mediaDialog?.open) mediaDialog.close();
  cleanupMedia();
}
function ensureDialog() {
  if (mediaDialog) return;
  mediaDialog=el('dialog','','media-modal');mediaDialog.setAttribute('aria-labelledby','media-modal-title');
  const heading=el('h2','','media-modal-title');heading.id='media-modal-title';
  const close=el('button','✕','modal-close');close.type='button';close.setAttribute('aria-label','Close media viewer');close.addEventListener('click',closeMedia);
  const header=el('div','','modal-header');header.append(heading,close);
  const content=el('div','','modal-content');mediaDialog.append(header,content);document.body.append(mediaDialog);
  mediaDialog.addEventListener('click',event=>{if(event.target===mediaDialog){const r=mediaDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeMedia();}});
  mediaDialog.addEventListener('close',cleanupMedia);
  mediaDialog.addEventListener('cancel',event=>{event.preventDefault();closeMedia();});
  mediaDialog.addEventListener('keydown',event=>{
    if (event.key==='Tab') {
      const focusable=[...mediaDialog.querySelectorAll('button, a[href], video[controls]')].filter(n=>!n.hidden&&!n.disabled);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  });
}
function openMedia(media,title,index,opener) {
  ensureDialog();modalDispose?.();modalOpener=opener;
  $('#media-modal-title').textContent=text(title);
  const viewer=createMedia(media,title,true,index);
  $('.modal-content').replaceChildren(viewer.node);
  const arrow=event=>{if(media.type==='images'&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();viewer.navigate(event.key==='ArrowRight'?1:-1);}};
  mediaDialog.addEventListener('keydown',arrow);
  modalDispose=()=>{viewer.dispose();mediaDialog.removeEventListener('keydown',arrow);};
  hoverPreviews.forEach(video => video.pause());
  mediaDialog.showModal();document.body.classList.add('modal-open');$('.modal-close').focus();
  const video = mediaDialog.querySelector('video');
  if (video) video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
}
function appendMedia(parent,media,title) {const viewer=createMedia(media,title);if(viewer)parent.append(viewer.node);}
function renderPersonal(data) {
  const p=data.profile,personal=data.personal||{};
  document.title=text(p.name)+' — Personal';
  $('meta[name="description"]').content=text(personal.intro || 'The personal side of '+p.name);
  const hero=$('#hero');hero.replaceChildren();hero.hidden=false;
  const copy=el('div','','hero-text');
  copy.append(el('p','Away from the keyboard','eyebrow'),el('h1',personal.title || 'A life beyond the screen.','hero-title'));
  if(personal.intro)copy.append(el('p',personal.intro,'hero-copy'));
  hero.append(copy,makePhoto(personal.photo || 'public/mukul_personal',p.name));
  section('hobbies',list(personal.hobbies),hobby=>{
    const card=el('article','','project-card hobby-card');
    appendMedia(card,hobby.media,hobby.title);
    if(hobby.icon)card.append(el('span',hobby.icon,'hobby-icon'));
    card.append(el('h3',hobby.title),el('p',hobby.description));return card;
  });
  section('travel',[...list(personal.travel)].sort((a,b)=>text(b.date).localeCompare(text(a.date))),trip=>{
    const card=el('article','','project-card travel-card');appendMedia(card,trip.media,trip.place);
    card.append(el('p',dateLabel(trip.date),'project-type'),el('h3',trip.place),el('p',trip.note));return card;
  });
  $('.nav').replaceChildren();
  for(const [id,label] of [['hobbies','Hobbies'],['travel','Travel']])if(!$('#'+id).hidden){const a=el('a',label);a.href='#'+id;$('.nav').append(a);}
}

function render(data) {
  mediaDisposers.splice(0).forEach(dispose=>dispose());
  validate(data);
  mediaAutoplay = data.settings?.autoplay !== false;
  const p = data.profile;
  document.title = text(p.name) + ' — ' + text(p.role);
  $('meta[name="description"]').content = text(data.about?.summary || p.tagline || p.role);
  $('.brand').textContent = text(p.name);
  if (document.body.dataset.page === 'personal') {
    renderPersonal(data);
    $('#footer-copy').textContent = '© ' + new Date().getFullYear() + ' ' + text(p.name) + '. Made with clouds.';
    $('#sample-note').hidden = data.settings?.sampleData !== true; $('#load-state').hidden = true; return;
  }
  const hero = $('#hero'); hero.replaceChildren(); hero.hidden = false;
  const copy = el('div', '', 'hero-text');
  copy.append(el('p', p.role, 'eyebrow'), el('h1', p.tagline || p.name, 'hero-title'));
  const detail = [p.location, p.availability].map(text).filter(Boolean).join(' · ');
  if (detail) copy.append(el('p', detail, 'hero-copy'));
  const actions = el('div', '', 'actions');
  for (const [label, id, enabled] of [['See my work','work',list(data.projects).length],['Say hello','contact',data.contact?.email || data.contact?.phone || list(data.contact?.links).some(x => safeURL(x.url))]]) {
    if (enabled) { const a = el('a', label, 'button ' + (id === 'work' ? 'button-primary' : 'button-secondary')); a.href = '#' + id; actions.append(a); }
  }
  let resume = externalLink('Résumé ↗', p.resumeUrl);
  if (!resume && mediaURL(p.resumeUrl) && /\.pdf$/i.test(text(p.resumeUrl))) { resume=el('a','Résumé ↗');resume.href=mediaURL(p.resumeUrl);resume.target='_blank';resume.rel='noopener noreferrer'; }
  if (resume) { resume.className = 'button button-secondary'; actions.append(resume); }
  copy.append(actions); hero.append(copy, makePhoto(p.photo || p.avatar || 'public/mukul_pic', p.name));
  const about = $('#about .about-grid'); about.replaceChildren();
  const facts = list(data.about?.facts);
  if (data.about?.summary) about.append(el('p', data.about.summary));
  const ul = el('ul', '', 'facts');
  facts.forEach(f => { const li = el('li'); li.append(el('span', f.label), document.createTextNode(text(f.value))); ul.append(li); });
  if (facts.length) about.append(ul);
  $('#about').hidden = !data.about?.summary && !facts.length;
  section('skills', list(data.skills), group => {
    const block = el('div'); block.append(el('h3', group.group));
    strings(group.items).forEach(item => block.append(el('span', item, 'tag'))); return block;
  });
  section('work', [...list(data.projects)].sort((a,b) => Number(b.featured === true) - Number(a.featured === true)), (project,i) => {
    const card = el('article', '', 'project-card');
    appendMedia(card, project.media, project.title);
    card.append(el('span', String(i+1).padStart(2,'0'), 'project-number'), el('p', [project.type,project.year].map(text).filter(Boolean).join(' · '), 'project-type'), el('h3', project.title), el('p', project.description));
    const tags = el('div', '', 'project-tech'); strings(project.tech).forEach(t => tags.append(el('span', t, 'tag'))); card.append(tags);
    appendLinks(card, project.links); return card;
  });
  section('experience', list(data.experience), job => {
    const card = el('article', '', 'experience-item'); card.append(el('p', [dateLabel(job.start) + ' – ' + (job.end ? dateLabel(job.end) : 'Present'), job.location].filter(Boolean).join(' · '), 'experience-meta'), el('h3', [job.role, job.company].map(text).filter(Boolean).join(' · ')));
    const ul = el('ul'); strings(job.highlights).forEach(h => ul.append(el('li', h))); card.append(ul); return card;
  });
  section('events', [...list(data.events)].sort((a,b) => text(b.date).localeCompare(text(a.date))), event => {
    const card = el('article', '', 'event-item');
    card.append(el('span', event.kind || 'Event', 'event-kind'), el('h3', event.name), el('p', [dateLabel(event.date),event.role,event.location].map(text).filter(Boolean).join(' · '), 'event-meta'));
    if (event.description) card.append(el('p', event.description));
    if (event.achievement) card.append(el('p', event.achievement, 'event-achievement'));
    appendLinks(card, [{label:'Event details ↗',url:event.url}]); return card;
  });
  section('education', list(data.education), item => {
    const card = el('article', '', 'experience-item'); card.append(el('h3', item.degree), el('p', item.school), el('p', dateLabel(item.start) + ' – ' + (item.end ? dateLabel(item.end) : 'Present'), 'experience-meta')); return card;
  });
  section('certifications', list(data.certifications), item => {
    const card = el('article', '', 'experience-item'); card.append(el('h3', item.name), el('p', [item.issuer,item.year].map(text).filter(Boolean).join(' · '))); appendLinks(card,[{label:'View credential ↗',url:item.url}]); return card;
  });
  const contact = $('#contact .contact-content'); contact.replaceChildren();
  const email = text(data.contact?.email).trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { const a = el('a', email, 'button button-primary'); a.href = 'mailto:' + email; contact.append(a); }
  const phone = text(data.contact?.phone).trim();
  if (/^\+?[\d\s().-]+$/.test(phone)) { const a = el('a', phone); a.href = 'tel:' + phone.replace(/[^+\d]/g,''); const line=el('p');line.append(a);contact.append(line); }
  appendLinks(contact, data.contact?.links);
  $('#contact').hidden = !contact.childNodes.length;
  $('.nav').replaceChildren();
  for (const [id,label] of [['about','About'],['work','Projects'],['events','Events'],['contact','Contact']]) {
    if (!$('#'+id).hidden) { const a = el('a',label); a.href = '#'+id; $('.nav').append(a); }
  }
  $('#footer-copy').textContent = '© ' + new Date().getFullYear() + ' ' + text(p.name) + '. Made with clouds.';
  $('#sample-note').hidden = data.settings?.sampleData !== true;
  $('#load-state').hidden = true;
}
function showError(error) {
  const box = $('#load-state');
  box.hidden = false;
  box.replaceChildren(el('h2', 'Check your portfolio data'), el('p', error.message), el('p', 'Edit profile.js, save it, then refresh this page. Keep the window.PORTFOLIO_DATA assignment and use valid JSON inside its braces.'));
}
function loadProfile() {
  try {
    if (!window.PORTFOLIO_DATA) throw new Error('profile.js is missing or contains a syntax error.');
    render(window.PORTFOLIO_DATA);
  } catch (error) { showError(error); }
}
loadProfile();
