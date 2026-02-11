// Mock data for development — simulates API responses

export interface MatchResult {
  id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  date: string;
}

export interface CandidateResume {
  id: string;
  name: string;
  email: string;
  matchScore: number;
  skills: string[];
  experience: string;
  uploadDate: string;
}

export interface UserStats {
  totalMatches: number;
  avgScore: number;
  totalUsers: number;
  resumesProcessed: number;
  totalJobDescriptions: number;
}

export const sampleMatchResults: MatchResult[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    matchScore: 85,
    matchedSkills: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "Git"],
    missingSkills: ["GraphQL", "AWS", "Docker"],
    suggestions: [
      "Add experience with GraphQL — consider building a side project using Apollo Client.",
      "Mention any cloud deployment experience, even personal projects.",
      "Consider getting AWS Cloud Practitioner certification.",
    ],
    date: "2026-02-05",
  },
  {
    id: "2",
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    matchScore: 72,
    matchedSkills: ["JavaScript", "Node.js", "React", "MongoDB"],
    missingSkills: ["Python", "Kubernetes", "CI/CD", "PostgreSQL"],
    suggestions: [
      "Highlight any backend API development experience more prominently.",
      "Add Python to your skillset — free courses available on Coursera.",
      "Document any CI/CD pipeline experience in your projects section.",
    ],
    date: "2026-02-03",
  },
  {
    id: "3",
    jobTitle: "UI/UX Developer",
    company: "DesignHub",
    matchScore: 91,
    matchedSkills: ["React", "CSS", "Figma", "Responsive Design", "Accessibility", "JavaScript"],
    missingSkills: ["Vue.js"],
    suggestions: [
      "Your profile is an excellent match! Consider adding Vue.js for broader reach.",
      "Emphasize your accessibility expertise — it's increasingly in demand.",
    ],
    date: "2026-02-01",
  },
];

export const sampleCandidates: CandidateResume[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    matchScore: 92,
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
    experience: "4 years",
    uploadDate: "2026-02-06",
  },
  {
    id: "2",
    name: "Rahul Mehta",
    email: "rahul.m@email.com",
    matchScore: 87,
    skills: ["Python", "React", "PostgreSQL", "REST APIs"],
    experience: "3 years",
    uploadDate: "2026-02-05",
  },
  {
    id: "3",
    name: "Ananya Gupta",
    email: "ananya.g@email.com",
    matchScore: 78,
    skills: ["JavaScript", "Vue.js", "CSS", "MongoDB"],
    experience: "2 years",
    uploadDate: "2026-02-05",
  },
  {
    id: "4",
    name: "Vikram Singh",
    email: "vikram.s@email.com",
    matchScore: 74,
    skills: ["Java", "Spring Boot", "React", "MySQL"],
    experience: "5 years",
    uploadDate: "2026-02-04",
  },
  {
    id: "5",
    name: "Neha Patel",
    email: "neha.p@email.com",
    matchScore: 65,
    skills: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    experience: "1 year",
    uploadDate: "2026-02-04",
  },
];

export const skillOverlapData = [
  { skill: "React", candidate: 90, required: 85 },
  { skill: "TypeScript", candidate: 75, required: 80 },
  { skill: "Node.js", candidate: 60, required: 70 },
  { skill: "CSS", candidate: 95, required: 60 },
  { skill: "Git", candidate: 85, required: 75 },
  { skill: "Docker", candidate: 30, required: 65 },
  { skill: "AWS", candidate: 20, required: 55 },
];

export const adminStats: UserStats = {
  totalMatches: 1247,
  avgScore: 76.3,
  totalUsers: 384,
  resumesProcessed: 2103,
  totalJobDescriptions: 156,
};

export const usageData = [
  { month: "Sep", matches: 120, users: 45 },
  { month: "Oct", matches: 180, users: 62 },
  { month: "Nov", matches: 240, users: 89 },
  { month: "Dec", matches: 310, users: 124 },
  { month: "Jan", matches: 390, users: 168 },
  { month: "Feb", matches: 420, users: 195 },
];

export const adminUsers = [
  { id: "1", name: "Priya Sharma", email: "priya@email.com", role: "Candidate", status: "Active", lastLogin: "2026-02-06" },
  { id: "2", name: "Rahul Mehta", email: "rahul@email.com", role: "Candidate", status: "Active", lastLogin: "2026-02-05" },
  { id: "3", name: "HR Manager", email: "hr@techcorp.com", role: "Recruiter", status: "Active", lastLogin: "2026-02-06" },
  { id: "4", name: "Ananya Gupta", email: "ananya@email.com", role: "Candidate", status: "Inactive", lastLogin: "2026-01-20" },
  { id: "5", name: "Recruiter Team", email: "recruit@startup.com", role: "Recruiter", status: "Active", lastLogin: "2026-02-04" },
];

export const recentActivity = [
  { id: "1", action: "Resume Matched", user: "Priya Sharma", detail: "Senior Frontend Developer @ TechCorp", score: 92, time: "2 min ago" },
  { id: "2", action: "New Registration", user: "Amit Kumar", detail: "Joined as Candidate", score: null, time: "15 min ago" },
  { id: "3", action: "JD Uploaded", user: "HR Manager", detail: "Full Stack Engineer position", score: null, time: "1 hr ago" },
  { id: "4", action: "Resume Matched", user: "Rahul Mehta", detail: "Backend Developer @ StartupXYZ", score: 87, time: "2 hrs ago" },
  { id: "5", action: "Resume Matched", user: "Neha Patel", detail: "UI/UX Developer @ DesignHub", score: 65, time: "3 hrs ago" },
  { id: "6", action: "New Registration", user: "Recruiter Team", detail: "Joined as Recruiter", score: null, time: "5 hrs ago" },
];
