import data from '../../portfolio.json'

export const ZONES = [
  {
    id: 'about',
    name: 'About Me',
    position: [0, 0, -30],
    color: '#66bb6a',
    icon: '👤',
    description: 'Learn about Mukul',
    content: {
      type: 'about',
      title: data.personal.name,
      subtitle: `${data.personal.title} | ${data.personal.tagline}`,
      body: data.summary,
      education: data.education.map(e => `${e.degree} – ${e.institution} (${e.year})`),
      experience: data.experience.map(e => ({
        role: e.role,
        company: e.company,
        duration: e.duration,
        desc: e.points[0],
      })),
    },
  },
  {
    id: 'skills',
    name: 'Skills',
    position: [30, 0, 0],
    color: '#42a5f5',
    icon: '⚡',
    description: 'Technical skills',
    content: {
      type: 'skills',
      title: 'Technical Skills',
      categories: data.skills.categories,
    },
  },
  {
    id: 'projects',
    name: 'Projects',
    position: [0, 0, 30],
    color: '#ab47bc',
    icon: '🚀',
    description: 'My projects',
    content: {
      type: 'projects',
      title: 'My Projects',
      items: data.projects.map(p => ({ name: p.name, tech: p.tech, desc: p.desc })),
    },
  },
  {
    id: 'contact',
    name: 'Contact',
    position: [-30, 0, 0],
    color: '#ff7043',
    icon: '📬',
    description: 'Get in touch',
    content: {
      type: 'contact',
      title: 'Wanna Work With Me?',
      available: data.personal.available,
      phone: data.personal.phone,
      email: data.personal.email,
      github: data.personal.github,
    },
  },
]
