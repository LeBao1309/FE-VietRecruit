import { Job, Application, JobType, ApplicationStatus } from '@/types';

// ─── Company Definitions ───
const COMPANIES = [
  { name: 'TechViet Corp', color: 'blue', logo: 'https://ui-avatars.com/api/?name=TV&background=4F46E5&color=fff&size=64&bold=true' },
  { name: 'Finhub', color: 'green', logo: 'https://ui-avatars.com/api/?name=FH&background=16A34A&color=fff&size=64&bold=true' },
  { name: 'EcoMart', color: 'orange', logo: 'https://ui-avatars.com/api/?name=EM&background=EA580C&color=fff&size=64&bold=true' },
  { name: 'EduStar', color: 'red', logo: 'https://ui-avatars.com/api/?name=ES&background=DC2626&color=fff&size=64&bold=true' },
  { name: 'Logistics AI', color: 'purple', logo: 'https://ui-avatars.com/api/?name=LA&background=9333EA&color=fff&size=64&bold=true' },
  { name: 'HealthPlus', color: 'teal', logo: 'https://ui-avatars.com/api/?name=HP&background=0D9488&color=fff&size=64&bold=true' },
] as const;

// ─── Job Title Definitions with level detection ───
type JobLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead';

const JOB_TITLES: { title: string; dept: string; skills: string[]; level: JobLevel }[] = [
  { title: 'Senior React Developer', dept: 'Engineering', skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Jest'], level: 'senior' },
  { title: 'Vue.js Specialist', dept: 'Engineering', skills: ['Vue 3', 'TypeScript', 'Pinia', 'Nuxt.js', 'CSS'], level: 'mid' },
  { title: 'Frontend Intern (React)', dept: 'Engineering', skills: ['React', 'JavaScript', 'HTML', 'CSS'], level: 'intern' },
  { title: 'Golang Backend Engineer', dept: 'Engineering', skills: ['Go', 'PostgreSQL', 'gRPC', 'Docker', 'Kubernetes'], level: 'senior' },
  { title: 'Java Spring Boot Lead', dept: 'Engineering', skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'AWS'], level: 'lead' },
  { title: 'Node.js Developer', dept: 'Engineering', skills: ['Node.js', 'TypeScript', 'MongoDB', 'REST API', 'Docker'], level: 'mid' },
  { title: 'iOS Developer (Swift)', dept: 'Mobile', skills: ['Swift', 'SwiftUI', 'iOS', 'Xcode', 'Core Data'], level: 'mid' },
  { title: 'Android Developer (Kotlin)', dept: 'Mobile', skills: ['Kotlin', 'Android', 'Jetpack Compose', 'Firebase'], level: 'mid' },
  { title: 'Flutter Engineer', dept: 'Mobile', skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'CI/CD'], level: 'mid' },
  { title: 'UI/UX Designer', dept: 'Design', skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'], level: 'mid' },
  { title: 'Product Owner', dept: 'Product', skills: ['Agile', 'JIRA', 'User Stories', 'Roadmapping'], level: 'senior' },
  { title: 'Business Analyst', dept: 'Product', skills: ['SQL', 'Excel', 'Requirements Analysis', 'Wireframing'], level: 'mid' },
  { title: 'Data Engineer', dept: 'Data', skills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'BigQuery'], level: 'mid' },
  { title: 'AI/ML Researcher', dept: 'Data', skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'], level: 'senior' },
  { title: 'Data Analyst', dept: 'Data', skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Power BI'], level: 'junior' },
  { title: 'DevOps Engineer', dept: 'Infrastructure', skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD'], level: 'senior' },
  { title: 'QA Engineer', dept: 'QA', skills: ['Cypress', 'Jest', 'Selenium', 'API Testing', 'Agile'], level: 'mid' },
  { title: 'Fullstack Developer', dept: 'Engineering', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'], level: 'mid' },
  { title: 'Security Engineer', dept: 'Infrastructure', skills: ['AWS', 'Penetration Testing', 'OWASP', 'Python', 'Network Security'], level: 'senior' },
  { title: 'Technical Writer', dept: 'Product', skills: ['Markdown', 'API Documentation', 'English', 'Git'], level: 'junior' },
];

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Remote'];

// ─── FIX #3: Gendered name arrays ───
const LAST_NAMES = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Bui', 'Do', 'Ngo', 'Dang'];
const MIDDLE_NAMES = ['Van', 'Minh', 'Duc', 'Quang', 'Huu'];
const MIDDLE_NAMES_F = ['Thi', 'Ngoc', 'Thanh', 'Phuong', 'Thuy'];
const MALE_FIRST_NAMES = ['Anh', 'Binh', 'Cuong', 'Dung', 'Hai', 'Hung', 'Khoa', 'Nam', 'Phuc', 'Quan', 'Son', 'Tuan', 'Hieu', 'Dat', 'Long'];
const FEMALE_FIRST_NAMES = ['Giang', 'Linh', 'Mai', 'Uyen', 'Vy', 'Xuan', 'Trang', 'Huong', 'Thao', 'Nga', 'Lan', 'Ha', 'Diem', 'Nhi', 'Trinh'];

// ─── Helpers ───
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function weightedLocation(): string {
  const r = Math.random();
  if (r < 0.40) return 'Remote';
  if (r < 0.70) return 'Ho Chi Minh City';
  if (r < 0.90) return 'Hanoi';
  return 'Da Nang';
}

// ─── FIX #2: Strict salary & experience bands ───
function salaryRange(level: JobLevel): [number, number] {
  switch (level) {
    case 'intern': return [200, 500];
    case 'junior': return [500, 1200];
    case 'mid': return [1200, 2500];
    case 'senior': return [2000, 4000];
    case 'lead': return [4000, 6000];
  }
}

function experienceRange(level: JobLevel): [number, number] {
  switch (level) {
    case 'intern': return [0, 1];
    case 'junior': return [1, 3];
    case 'mid': return [3, 6];
    case 'senior': return [5, 10];
    case 'lead': return [8, 15];
  }
}

// ─── FIX #5: Bio generator ───
const BIO_ADJECTIVES = [
  'Creative', 'Meticulous', 'Passionate', 'Results-driven', 'Analytical',
  'Resourceful', 'Detail-oriented', 'Collaborative', 'Strategic', 'Proactive',
  'Innovative', 'Versatile', 'Self-motivated', 'Curious', 'Pragmatic',
];
const BIO_FOCUS = [
  'scalable architecture', 'clean code practices', 'user experience', 'performance optimization',
  'cloud infrastructure', 'data-driven decisions', 'agile delivery', 'test automation',
  'cross-functional collaboration', 'system reliability', 'mobile-first design', 'API design',
  'security best practices', 'continuous improvement', 'team mentorship',
];

function generateBio(adjIdx: number, role: string, skill: string): string {
  const adj = BIO_ADJECTIVES[adjIdx % BIO_ADJECTIVES.length];
  const focus = BIO_FOCUS[adjIdx % BIO_FOCUS.length];
  return `${adj} ${role} focused on ${skill} and ${focus}.`;
}

function generateJobDescription(title: string, skills: string[], company: string): string {
  return `## ${title}

Join ${company} as a ${title}. We are looking for a passionate professional to help us build world-class products.

## Responsibilities

- Drive technical solutions and collaborate with cross-functional teams
- Design, develop, and maintain high-quality software
- Participate in code reviews and contribute to engineering best practices
- Mentor team members and contribute to a culture of learning

## Requirements

${skills.map(s => `- Experience with **${s}**`).join('\n')}
- Strong problem-solving and communication skills
- Ability to work independently and in a team

## What We Offer

- Competitive salary and annual bonus
- Flexible working arrangements (Remote / Hybrid)
- Health insurance and wellness programs
- Professional development budget`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Hardcoded demo scenarios ───
const DEMO_JOBS: Job[] = [
  {
    id: 'jd_architect',
    title: 'Principal Software Architect',
    company: 'TechViet Corp',
    location: 'Remote',
    type: 'Full-time',
    salaryMin: 5000,
    salaryMax: 8000,
    description: `## Principal Software Architect

Lead the technical vision for TechViet Corp's entire product suite. This is a strategic leadership role defining system-wide architecture across 10+ engineering teams.

## Responsibilities

- Define and evolve the overall system architecture for enterprise products
- Evaluate and adopt emerging technologies (AI/ML, cloud-native, edge computing)
- Lead architecture review boards and set technical standards
- Mentor Staff and Senior engineers across the organization

## Requirements

- 10+ years of software engineering experience
- Experience with **distributed systems** at scale
- Deep expertise in **cloud platforms** (AWS/GCP/Azure)
- Strong background in **microservices**, **event-driven architecture**
- Published papers or conference talks preferred

## What We Offer

- $5,000 – $8,000/month + equity
- Fully remote with quarterly team retreats
- Direct report to CTO`,
    skills: ['Distributed Systems', 'Cloud Architecture', 'Microservices', 'AWS', 'System Design', 'Kubernetes'],
    department: 'Engineering',
    postedDays: 2,
    isActive: true,
  },
  {
    id: 'jd_intern',
    title: 'Frontend Intern',
    company: 'EduStar',
    location: 'Hanoi',
    type: 'Part-time',
    salaryMin: 200,
    salaryMax: 300,
    description: `## Frontend Intern

EduStar is looking for an enthusiastic intern to join our engineering team and learn modern frontend development.

## What You'll Do

- Build UI components using **React** and **TypeScript**
- Collaborate with senior developers on real product features
- Write unit tests and participate in code reviews
- Learn best practices for web accessibility and performance

## Requirements

- Currently pursuing a degree in Computer Science or related field
- Basic knowledge of **HTML**, **CSS**, **JavaScript**
- Eagerness to learn **React** and modern web technologies
- Good communication skills in English

## What We Offer

- $200 – $300/month stipend
- Mentorship from experienced engineers
- Flexible schedule (20 hrs/week)
- Certificate of completion and potential full-time offer`,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
    department: 'Engineering',
    postedDays: 1,
    isActive: true,
  },
];

const ALL_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'Swift', 'Kotlin',
  'Vue 3', 'Angular', 'Next.js', 'Tailwind CSS', 'GraphQL', 'REST API', 'Docker',
  'Kubernetes', 'AWS', 'GCP', 'PostgreSQL', 'MongoDB', 'Redis', 'Figma',
  'CI/CD', 'Terraform', 'Jest', 'Cypress', 'Firebase', 'Spring Boot', 'Django',
  'Flutter', 'Dart', 'SQL', 'Elasticsearch', 'RabbitMQ', 'TensorFlow',
];

const STATUSES: ApplicationStatus[] = ['Applied', 'Screening', 'Interview', 'Rejected'];

// ─── FIX #4: Generate mock interview data for advanced stages ───
function generateMockInterview(appliedDate: Date): { date: string; time: string; link: string } {
  const interviewOffset = rand(3, 10);
  const interviewDate = new Date(appliedDate.getTime() + interviewOffset * 86400000);
  const hours = pick(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
  return {
    date: formatDate(interviewDate),
    time: hours,
    link: `https://meet.google.com/${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`,
  };
}

// ─── Main generators ───
export function generateBulkJobs(existingCount: number): Job[] {
  const jobs: Job[] = [...DEMO_JOBS];
  let companyIdx = 0;

  for (let i = 0; i < 60; i++) {
    const template = JOB_TITLES[i % JOB_TITLES.length];
    const company = COMPANIES[companyIdx % COMPANIES.length];
    companyIdx++;

    const [sMin, sMax] = salaryRange(template.level);
    const salaryMin = rand(sMin, Math.floor((sMin + sMax) / 2));
    const salaryMax = rand(Math.ceil((sMin + sMax) / 2), sMax);
    const isClosed = Math.random() < 0.15;
    const postedDays = rand(1, 30);

    jobs.push({
      id: `jg_${existingCount + i}`,
      title: template.title,
      company: company.name,
      location: weightedLocation(),
      type: pick(JOB_TYPES),
      salaryMin,
      salaryMax,
      description: generateJobDescription(template.title, template.skills, company.name),
      skills: [...template.skills],
      department: template.dept,
      postedDays,
      isActive: !isClosed,
    });
  }
  return jobs;
}

export function generateBulkApplications(
  targetJobId: string, targetJobTitle: string, targetJobCompany: string,
  targetJobSkills: string[], existingAppCount: number,
  jobPostedDays?: number
): Application[] {
  const apps: Application[] = [];
  const usedNames = new Set<string>();
  const jobPostedDate = new Date(Date.now() - (jobPostedDays ?? 7) * 86400000);

  for (let i = 0; i < 55; i++) {
    // FIX #3: Gender-consistent names
    const isMale = i % 2 === 0;
    const firstName = isMale ? pick(MALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES);
    const middleName = isMale ? pick(MIDDLE_NAMES) : pick(MIDDLE_NAMES_F);
    let name: string;
    do {
      name = `${pick(LAST_NAMES)} ${middleName} ${firstName}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    let score: number;
    const r = Math.random();
    if (r < 0.1) score = rand(80, 98);
    else if (r < 0.5) score = rand(50, 79);
    else score = rand(15, 49);

    const status = pick(STATUSES);

    // FIX #1: appliedDate must be AFTER jobPostedDate
    const maxDaysAfterPost = Math.max(1, Math.floor((Date.now() - jobPostedDate.getTime()) / 86400000));
    const daysAfterPost = rand(0, maxDaysAfterPost);
    const appliedDateObj = new Date(jobPostedDate.getTime() + daysAfterPost * 86400000);
    const appliedDate = formatDate(appliedDateObj);

    const skills = pickN(ALL_SKILLS, rand(3, 6));

    // FIX #2: Level-appropriate experience based on job title inference
    const jobLevel = inferLevelFromTitle(targetJobTitle);
    const [expMin, expMax] = experienceRange(jobLevel);
    const experience = rand(expMin, expMax);

    // FIX #5: Unique bio per candidate
    const roleLabel = targetJobTitle.replace(/\(.*\)/, '').trim().split(' ').slice(-2).join(' ');
    const bio = generateBio(i, roleLabel, skills[0] || 'technology');

    const timeline: { status: string; date: string; message?: string }[] = [
      { status: 'Applied', date: appliedDate },
    ];

    // FIX #4: interview data for advanced stages
    let interviewDate: string | undefined;
    let interviewTime: string | undefined;
    let meetingLink: string | undefined;

    if (status === 'Screening' || status === 'Interview' || status === 'Rejected') {
      timeline.push({ status: 'Screening', date: appliedDate, message: 'Profile under review' });
    }
    if (status === 'Interview') {
      const interview = generateMockInterview(appliedDateObj);
      interviewDate = interview.date;
      interviewTime = interview.time;
      meetingLink = interview.link;
      timeline.push({ status: 'Interview', date: interview.date, message: `Interview at ${interview.time}` });
    }
    if (status === 'Rejected') {
      timeline.push({ status: 'Rejected', date: appliedDate, message: 'Did not meet requirements' });
    }

    const emailFirst = firstName.toLowerCase();
    const emailLast = name.split(' ')[0].toLowerCase();

    apps.push({
      id: `ag_${existingAppCount + i}`,
      candidateId: `cg_${i}`,
      candidateName: name,
      candidateEmail: `${emailFirst}.${emailLast}${rand(1, 99)}@email.com`,
      candidatePhone: `+84 9${rand(10, 99)} ${rand(100, 999)} ${rand(100, 999)}`,
      candidateAvatar: '',
      candidateExperience: experience,
      candidateSkills: skills,
      jobId: targetJobId,
      jobTitle: targetJobTitle,
      company: targetJobCompany,
      status,
      score,
      appliedDate,
      lastUpdate: appliedDate,
      interviewDate,
      interviewTime,
      meetingLink,
      timeline,
      privateNotes: bio, // Store bio in privateNotes for recruiter visibility
    });
  }
  return apps;
}

function inferLevelFromTitle(title: string): JobLevel {
  const t = title.toLowerCase();
  if (t.includes('intern')) return 'intern';
  if (t.includes('junior') || t.includes('analyst') || t.includes('writer')) return 'junior';
  if (t.includes('lead') || t.includes('principal') || t.includes('owner') || t.includes('architect')) return 'lead';
  if (t.includes('senior') || t.includes('devops') || t.includes('security') || t.includes('researcher')) return 'senior';
  return 'mid';
}

const BULK_DATA_KEY = 'talentos_bulkGenerated';

export function ensureBulkData(
  currentJobs: Job[],
  currentApps: Application[],
  setJobs: (jobs: Job[]) => void,
  setApps: (apps: Application[]) => void
) {
  if (localStorage.getItem(BULK_DATA_KEY)) return;

  const bulkJobs = generateBulkJobs(currentJobs.length);
  const allJobs = [...currentJobs, ...bulkJobs];

  const targetJob = currentJobs[0] || bulkJobs[0];
  const bulkApps = generateBulkApplications(
    targetJob.id, targetJob.title, targetJob.company, targetJob.skills, currentApps.length,
    targetJob.postedDays
  );
  const allApps = [...currentApps, ...bulkApps];

  setJobs(allJobs);
  setApps(allApps);
  localStorage.setItem(BULK_DATA_KEY, 'true');
}
