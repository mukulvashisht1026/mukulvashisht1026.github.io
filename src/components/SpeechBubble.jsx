// ── Content renderers (light theme) ───────────────────────────

function AboutContent({ content }) {
  return (
    <div>
      <h2 className="zc-name">{content.title}</h2>
      <p className="zc-subtitle">{content.subtitle}</p>
      <p className="zc-text">{content.body}</p>
      <h3 className="zc-section">Education</h3>
      <ul className="zc-list">
        {content.education.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <h3 className="zc-section">Experience</h3>
      {content.experience.map((exp, i) => (
        <div key={i} className="zc-exp">
          <div className="zc-exp-header">
            <strong>{exp.role}</strong>
            <span className="zc-company">@ {exp.company}</span>
            <span className="zc-dur">({exp.duration})</span>
          </div>
          <p>{exp.desc}</p>
        </div>
      ))}
    </div>
  )
}

function SkillsContent({ content }) {
  return (
    <div>
      {content.categories.map(cat => (
        <div key={cat.name} className="zc-skill-cat">
          <h3 className="zc-section">{cat.name}</h3>
          <div className="zc-pills">
            {cat.items.map(item => <span key={item} className="zc-pill">{item}</span>)}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsContent({ content }) {
  return (
    <div className="zc-projects">
      {content.items.map(item => (
        <div key={item.name} className="zc-project">
          <div className="zc-project-header">
            <h3>{item.name}</h3>
            <span className="zc-tech">{item.tech}</span>
          </div>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

function ContactContent({ content }) {
  return (
    <div>
      <h2 className="zc-name">{content.title}</h2>
      {content.available && (
        <div className="zc-available">
          <span className="zc-dot" />
          Currently Available for Work
        </div>
      )}
      <div className="zc-contact-list">
        <a className="zc-contact" href={`tel:${content.phone}`}>
          <span>📱</span>{content.phone}
        </a>
        <a className="zc-contact" href={`mailto:${content.email}`}>
          <span>📧</span>{content.email}
        </a>
        <a className="zc-contact" href={`https://github.com/${content.github}`} target="_blank" rel="noreferrer">
          <span>🐙</span>github.com/{content.github}
        </a>
      </div>
    </div>
  )
}

const CONTENT_MAP = {
  about: AboutContent,
  skills: SkillsContent,
  projects: ProjectsContent,
  contact: ContactContent,
}

// ── SpeechBubble component ─────────────────────────────────────

export default function SpeechBubble({ zone, onClose }) {
  const Content = CONTENT_MAP[zone.content.type]

  return (
    <div className="bubble-positioner">
      <div
        className="speech-bubble"
        style={{ '--zc': zone.color }}
        onKeyDown={e => {
          if (['ArrowUp', 'ArrowDown'].includes(e.code)) e.stopPropagation()
        }}
      >
        <div className="bubble-header">
          <span className="bubble-icon">{zone.icon}</span>
          <span className="bubble-zone-name" style={{ color: zone.color }}>{zone.name}</span>
          <button className="bubble-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="bubble-body">
          <Content content={zone.content} />
        </div>

        {/* Triangle tail pointing down toward monk */}
        <div className="bubble-tail-outer" />
        <div className="bubble-tail-inner" />
      </div>
    </div>
  )
}
