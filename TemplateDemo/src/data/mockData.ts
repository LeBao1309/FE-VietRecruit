import { Job, Application, Profile, AppNotification, Settings } from '@/types';

export const defaultJobs: Job[] = [
  {
    id: 'j1', title: 'Senior Frontend Developer', company: 'TechViet Corp',
    location: 'Remote', type: 'Remote', salaryMin: 2000, salaryMax: 3500,
    description: `## About the Role\n\nWe're looking for a Senior Frontend Developer to lead our web application development.\n\n## Responsibilities\n\n- Build and maintain scalable React applications with TypeScript\n- Collaborate with designers to implement pixel-perfect UIs\n- Mentor junior developers and conduct code reviews\n- Optimize application performance and accessibility\n- Contribute to architectural decisions and technical planning\n\n## Requirements\n\n- 4+ years of experience with **React** and **TypeScript**\n- Strong understanding of modern CSS (Tailwind, CSS-in-JS)\n- Experience with **Node.js** backend development\n- Familiarity with CI/CD pipelines and testing frameworks\n- Excellent communication skills in English`,
    skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'GraphQL'],
    department: 'Engineering', postedDays: 3, isActive: true,
  },
  {
    id: 'j2', title: 'Product Designer', company: 'Finhub Vietnam',
    location: 'Ho Chi Minh City', type: 'Hybrid', salaryMin: 1500, salaryMax: 2500,
    description: `## Product Designer\n\nJoin our design team to create beautiful fintech experiences.\n\n## What You'll Do\n\n- Design user interfaces for web and mobile banking products\n- Conduct user research and usability testing\n- Create design systems and component libraries\n- Collaborate closely with product managers and engineers\n\n## Requirements\n\n- 3+ years of product design experience\n- Proficiency in **Figma** and prototyping tools\n- Strong portfolio showcasing fintech or SaaS projects\n- Understanding of design systems and accessibility`,
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    department: 'Design', postedDays: 5, isActive: true,
  },
  {
    id: 'j3', title: 'Backend Engineer (Go)', company: 'Logistics AI',
    location: 'Remote', type: 'Remote', salaryMin: 2500, salaryMax: 4000,
    description: `## Backend Engineer\n\nBuild high-performance microservices for our logistics platform.\n\n- Design and implement RESTful APIs in Go\n- Work with PostgreSQL and Redis\n- Deploy on Kubernetes clusters\n- Write comprehensive tests`,
    skills: ['Go', 'PostgreSQL', 'Kubernetes', 'Redis', 'gRPC'],
    department: 'Engineering', postedDays: 12, isActive: false,
  },
  {
    id: 'j4', title: 'iOS Developer', company: 'Vinova',
    location: 'Hanoi', type: 'On-site', salaryMin: 1800, salaryMax: 2800,
    description: `## iOS Developer\n\nBuild native iOS applications for millions of users.\n\n- Develop features using **Swift** and **SwiftUI**\n- Integrate with REST APIs and local databases\n- Ensure smooth performance on all device sizes\n- Publish and maintain apps on the App Store`,
    skills: ['Swift', 'SwiftUI', 'iOS', 'Xcode', 'Core Data'],
    department: 'Mobile', postedDays: 7, isActive: true,
  },
  {
    id: 'j5', title: 'Data Engineer', company: 'Analytics.vn',
    location: 'Remote', type: 'Remote', salaryMin: 1200, salaryMax: 1800,
    description: `## Data Engineer\n\nBuild data pipelines and analytics infrastructure.\n\n- Design ETL pipelines using **Python** and **Apache Spark**\n- Manage data warehouses on BigQuery\n- Create dashboards and reporting tools\n- Ensure data quality and governance`,
    skills: ['Python', 'SQL', 'Apache Spark', 'BigQuery', 'Airflow'],
    department: 'Data', postedDays: 2, isActive: true,
  },
];

export const defaultApplications: Application[] = [
  {
    id: 'a1', candidateId: 'c1', candidateName: 'Nguyễn Văn Anh',
    candidateEmail: 'anh.nguyen@email.com', candidatePhone: '+84 912 345 678',
    candidateAvatar: '', candidateExperience: 5,
    candidateSkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'GraphQL'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Interview', score: 92, appliedDate: 'Jan 10, 2025', lastUpdate: 'Jan 18, 2025',
    interviewDate: 'Jan 20', interviewTime: '10:00 AM',
    interviewDuration: '60m', interviewFormat: 'Video Call',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    timeline: [
      { status: 'Applied', date: 'Jan 10, 2025' },
      { status: 'Screening', date: 'Jan 13, 2025', message: 'CV reviewed by HR team' },
      { status: 'Interview', date: 'Jan 18, 2025', message: 'Technical interview scheduled' },
    ],
    privateNotes: '',
  },
  {
    id: 'a2', candidateId: 'c2', candidateName: 'Hoàng Đức Hải',
    candidateEmail: 'hai.hoang@email.com', candidatePhone: '+84 923 456 789',
    candidateAvatar: '', candidateExperience: 4,
    candidateSkills: ['React', 'TypeScript', 'AWS', 'Docker', 'CI/CD'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Offer', score: 85, appliedDate: 'Jan 8, 2025', lastUpdate: 'Jan 19, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 8, 2025' },
      { status: 'Screening', date: 'Jan 10, 2025' },
      { status: 'Interview', date: 'Jan 14, 2025' },
      { status: 'Offer', date: 'Jan 19, 2025', message: 'Offer extended — $3,200/mo' },
    ],
    privateNotes: '',
  },
  {
    id: 'a3', candidateId: 'c3', candidateName: 'Trần Thị Bảo',
    candidateEmail: 'bao.tran@email.com', candidatePhone: '+84 934 567 890',
    candidateAvatar: '', candidateExperience: 3,
    candidateSkills: ['React', 'Vue 3', 'Tailwind CSS', 'JavaScript'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Screening', score: 78, appliedDate: 'Jan 11, 2025', lastUpdate: 'Jan 15, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 11, 2025' },
      { status: 'Screening', date: 'Jan 15, 2025', message: 'Profile under review' },
    ],
    privateNotes: '',
  },
  {
    id: 'a4', candidateId: 'c4', candidateName: 'Vũ Thị Lan Anh',
    candidateEmail: 'lananh.vu@email.com', candidatePhone: '+84 945 678 901',
    candidateAvatar: '', candidateExperience: 6,
    candidateSkills: ['React', 'Redux', 'Python', 'Django'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Screening', score: 71, appliedDate: 'Jan 12, 2025', lastUpdate: 'Jan 16, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 12, 2025' },
      { status: 'Screening', date: 'Jan 16, 2025' },
    ],
    privateNotes: '',
  },
  {
    id: 'a5', candidateId: 'c5', candidateName: 'Lê Minh Cường',
    candidateEmail: 'cuong.le@email.com', candidatePhone: '+84 956 789 012',
    candidateAvatar: '', candidateExperience: 7,
    candidateSkills: ['Angular', 'Java', 'Spring Boot', 'MySQL'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Applied', score: 65, appliedDate: 'Jan 14, 2025', lastUpdate: 'Jan 14, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 14, 2025' },
    ],
    privateNotes: '',
  },
  {
    id: 'a6', candidateId: 'c6', candidateName: 'Bùi Quang Khải',
    candidateEmail: 'khai.bui@email.com', candidatePhone: '+84 967 890 123',
    candidateAvatar: '', candidateExperience: 8,
    candidateSkills: ['React Native', 'Mobile', 'JavaScript', 'Firebase'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Interview', score: 58, appliedDate: 'Jan 9, 2025', lastUpdate: 'Jan 17, 2025',
    interviewDate: 'Jan 22', interviewTime: '14:00',
    interviewDuration: '45m', interviewFormat: 'Video Call',
    meetingLink: 'https://zoom.us/j/123456789',
    timeline: [
      { status: 'Applied', date: 'Jan 9, 2025' },
      { status: 'Screening', date: 'Jan 12, 2025' },
      { status: 'Interview', date: 'Jan 17, 2025', message: 'Technical assessment scheduled' },
    ],
    privateNotes: '',
  },
  {
    id: 'a7', candidateId: 'c7', candidateName: 'Phạm Thùy Dương',
    candidateEmail: 'duong.pham@email.com', candidatePhone: '+84 978 901 234',
    candidateAvatar: '', candidateExperience: 2,
    candidateSkills: ['HTML', 'CSS', 'JavaScript', 'jQuery'],
    jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechViet Corp',
    status: 'Applied', score: 40, appliedDate: 'Jan 15, 2025', lastUpdate: 'Jan 15, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 15, 2025' },
    ],
    privateNotes: '',
  },
  // Candidate's own applications to other jobs
  {
    id: 'a8', candidateId: 'c1', candidateName: 'Nguyễn Văn Anh',
    candidateEmail: 'anh.nguyen@email.com', candidatePhone: '+84 912 345 678',
    candidateAvatar: '', candidateExperience: 5,
    candidateSkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'GraphQL'],
    jobId: 'j4', jobTitle: 'iOS Developer', company: 'Vinova',
    status: 'Screening', score: 45, appliedDate: 'Jan 12, 2025', lastUpdate: 'Jan 14, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 12, 2025' },
      { status: 'Screening', date: 'Jan 14, 2025', message: 'Application under review' },
    ],
    privateNotes: '',
  },
  {
    id: 'a9', candidateId: 'c1', candidateName: 'Nguyễn Văn Anh',
    candidateEmail: 'anh.nguyen@email.com', candidatePhone: '+84 912 345 678',
    candidateAvatar: '', candidateExperience: 5,
    candidateSkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'GraphQL'],
    jobId: 'j2', jobTitle: 'Product Designer', company: 'Finhub Vietnam',
    status: 'Applied', score: 38, appliedDate: 'Jan 14, 2025', lastUpdate: 'Jan 14, 2025',
    timeline: [
      { status: 'Applied', date: 'Jan 14, 2025' },
    ],
    privateNotes: '',
  },
];

export const defaultProfile: Profile = {
  name: 'Nguyễn Văn Anh',
  email: 'anh.nguyen@email.com',
  phone: '+84 912 345 678',
  linkedin: 'linkedin.com/in/nguyenvananh',
  location: 'Ho Chi Minh City, Vietnam',
  summary: 'Senior Frontend Developer with 5 years of experience building scalable web applications with React, TypeScript, and Node.js.',
  skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'GraphQL'],
  experiences: [
    { id: 'e1', company: 'TechViet Corp', title: 'Senior Frontend Developer', startDate: '2022-01', endDate: 'Present', description: 'Lead frontend architecture for enterprise SaaS products.' },
    { id: 'e2', company: 'Digital Solutions', title: 'Frontend Developer', startDate: '2020-03', endDate: '2021-12', description: 'Built responsive web applications using React and TypeScript.' },
  ],
  education: [
    { id: 'ed1', school: 'Vietnam National University', degree: "Bachelor's", major: 'Computer Science', year: '2019' },
  ],
  completionPercent: 68,
};

export const defaultNotifications: AppNotification[] = [
  {
    id: 'n1', recipientRole: 'candidate',
    message: 'Interview scheduled Jan 20 at 10:00 AM (GMT+7)',
    timestamp: '2025-01-18T09:30:00Z', isRead: false,
    type: 'interview_scheduled',
    metadata: { jobTitle: 'Senior Frontend Developer', meetingLink: 'https://meet.google.com/abc-defg-hij', interviewDate: 'Jan 20' },
  },
  {
    id: 'n2', recipientRole: 'candidate',
    message: 'Your iOS Developer application is under review',
    timestamp: '2025-01-14T14:00:00Z', isRead: false,
    type: 'status_change',
    metadata: { jobTitle: 'iOS Developer' },
  },
];

export const defaultSettings: Settings = {
  emailNotifications: true,
  inAppNotifications: true,
  companyName: 'TechViet Corp',
};

export const CURRENT_CANDIDATE_ID = 'c1';
