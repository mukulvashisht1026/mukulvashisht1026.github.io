function AboutContent({ content }) {
  return (
    <div>
      <h2 className="panel-name">{content.title}</h2>
      <p className="panel-subtitle">{content.subtitle}</p>
      <p className="panel-body">{content.body}</p>

      <h3 className="panel-section-title">Education</h3>
      <ul className="panel-list">
        {content.education.map((item, i) => <li key={i}>{item}</li>)}
      </ul>

      <h3 className="panel-section-title">Experience</h3>
      {content.experience.map((exp, i) => (
        <div key={i} className="exp-card">
          <div className="exp-header">
            <strong>{exp.role}</strong>
            <span className="exp-company">@ {exp.company}</span>
            <span className="exp-duration">({exp.duration})</span>
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
        <div key={cat.name} className="skill-category">
          <h3 className="panel-section-title">{cat.name}</h3>
          <div className="skill-pills">
            {cat.items.map(item => (
              <span key={item} className="skill-pill">{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsContent({ content }) {
  return (
    <div className="projects-grid">
      {content.items.map(item => (
        <div key={item.name} className="project-card">
          <div className="project-card-header">
            <h3>{item.name}</h3>
            <span className="project-tech">{item.tech}</span>
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
      <h2 className="panel-name">{content.title}</h2>
      {content.available && (
        <div className="available-badge">
          <span className="available-dot" />
          Currently Available for Work
        </div>
      )}
      <div className="contact-list">
        <a className="contact-item" href={`tel:${content.phone}`}>
          <span className="contact-icon">📱</span>
          <span>{content.phone}</span>
        </a>
        <a className="contact-item" href={`mailto:${content.email}`}>
          <span className="contact-icon">📧</span>
          <span>{content.email}</span>
        </a>
        <a
          className="contact-item"
          href={`https://github.com/${content.github}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-icon">🐙</span>
          <span>github.com/{content.github}</span>
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

export default function InfoPanel({ zone, onClose }) {
  const Content = CONTENT_MAP[zone.content.type]

  return (
    <div className="panel-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel" style={{ '--zone-color': zone.color }}>
        <div className="panel-header">
          <span className="panel-icon">{zone.icon}</span>
          <span className="panel-zone-name">{zone.name}</span>
          <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="panel-body">
          <Content content={zone.content} />
        </div>
      </div>
    </div>
  )
}
