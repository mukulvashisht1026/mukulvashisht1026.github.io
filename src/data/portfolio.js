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
      title: 'Mukul Vashisht',
      subtitle: 'Web Developer | ML Enthusiast',
      body: 'B.Tech CSE student at G.B. Pant Government Engineering College, Delhi. Passionate about building web applications and exploring machine learning.',
      education: [
        'B.Tech CSE – G.B. Pant Govt. Engineering College, Delhi (ongoing)',
        '12th – 90.2% CBSE, Vardhman Shiksha Mandir (2015)',
        '10th – 8.6 CGPA CBSE, Preet Public Sr. Sec. School (2013)',
      ],
      experience: [
        {
          role: 'Django Intern',
          company: 'Dietitio',
          duration: '45 days',
          desc: 'Built real-time Lead Management System in Django, deployed on Heroku.',
        },
      ],
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
      categories: [
        {
          name: 'Front-End',
          items: ['HTML', 'CSS', 'JavaScript', 'jQuery', 'ReactJS', 'Redux', 'Bootstrap'],
        },
        {
          name: 'Back-End',
          items: ['Django', 'NodeJS', 'PHP', 'SQL', 'Express', 'MongoDB', 'Django REST Framework'],
        },
        {
          name: 'Languages',
          items: ['C/C++', 'Python', 'Java'],
        },
      ],
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
      items: [
        {
          name: 'Real Time Chat Application',
          tech: 'Django Channels',
          desc: 'Real-time messaging app using WebSockets via Django Channels.',
        },
        {
          name: 'Lead Management System',
          tech: 'Django + Heroku',
          desc: 'Built during 45-day internship at Dietitio. Deployed on Heroku.',
        },
        {
          name: 'Chain Reaction Game',
          tech: 'JavaScript',
          desc: 'Web-based chain reaction strategy game.',
        },
        {
          name: 'Gamer Zone',
          tech: 'NodeJS',
          desc: 'Gaming platform with Node.js backend.',
        },
        {
          name: 'TODO List',
          tech: 'Django',
          desc: 'Task management application built with Django.',
        },
      ],
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
      available: true,
      phone: '+91 9899730037',
      email: 'mukul.vashisht.2610@gmail.com',
      github: 'mukulvashisht1026',
    },
  },
]
