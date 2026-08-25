// ─────────────────────────────────────────────────────────────
// This file is the single source of truth for every piece of
// personal / résumé content used across the game and the UI.
// Update this file and the whole experience updates with it.
// ─────────────────────────────────────────────────────────────

export interface EducationEntry {
  years: string
  institution: string
  detail: string
  result: string
  locationName: string // in-world region name
}

export interface ProjectEntry {
  id: string
  codename: string // in-world "creature" name
  title: string
  type: string // in-world "type" (e.g. Cloud / Steel)
  summary: string
  bullets: string[]
  stack: string[]
  github?: string
  /** Skill names (must match an entry in PROFILE.skills) that this project exercises. */
  skillTags?: string[]
  /** Rich, real project detail shown in the in-game Archive overlay. */
  archive?: {
    techStack: string[]
    features: string[]
    note?: string
    diagramSrc?: string
    diagramAlt?: string
    installerSrc?: string
    installerLabel?: string
  }
}

export interface EmploymentEntry {
  period: string
  role: string
  org: string
  location: string
  bullets: string[]
  bossName: string // in-world "Gym Leader" name
  /** Skill names (must match an entry in PROFILE.skills) that this role exercises. */
  skillTags?: string[]
}

export interface CertificationEntry {
  year: string
  name: string
  issuer: string
}

export const PROFILE = {
  name: 'Ritik Shetty',
  title: 'Computer Engineer',
  tagline: 'Systems, Cloud & Machine Learning',
  email: 'ritikshetty16@gmail.com',
  phone: '+91 9860488748',
  linkedin: 'https://linkedin.com/in/ritik-shetty',
  github: 'https://github.com/', // update with real handle when ready
  location: 'Mumbai, India',
  resumeFile: '/resume/Ritik_Shetty_Resume.pdf',

  education: [
    {
      years: '2022 – 2026',
      institution: "Vivekanand Education Society's Institute of Technology",
      detail: 'B.E., Computer Engineering',
      result: 'CGPA 9.35',
      locationName: 'Vertex City',
    },
    {
      years: '2020 – 2022',
      institution: 'Sathaye College of Science',
      detail: 'HSC',
      result: '82%',
      locationName: "Scholar's Route",
    },
    {
      years: '2020',
      institution: 'Holy Family High School',
      detail: 'SSC',
      result: '93%',
      locationName: 'Harmony Village',
    },
  ] as EducationEntry[],

  projects: [
    {
      id: 'chrono-cli',
      codename: 'ChronoCLI',
      title: 'AWS Cloud-Based Version Control & System State Management',
      type: 'Cloud / Steel',
      summary: 'Self-initiated CLI tool for managing file versions and system state on AWS.',
      bullets: [
        'Developed a CLI tool to manage file versions and system states using AWS services like S3, EC2, DynamoDB, and EBS.',
        'Implemented efficient snapshotting and secure user authentication using JWT and MongoDB.',
      ],
      stack: ['AWS S3', 'EC2', 'DynamoDB', 'EBS', 'JWT', 'MongoDB'],
      skillTags: ['Python', 'Flask', 'MongoDB'],
      archive: {
        techStack: ['Python', 'Flask', 'MongoDB', 'AWS S3', 'AWS EC2', 'AWS DynamoDB', 'AWS EBS', 'AWS CloudWatch', 'JWT', 'Docker', 'PyInstaller'],
        features: [
          'Three-layer architecture: CLI client → Flask REST backend → cloud/database layer (MongoDB + DynamoDB + S3/EBS/EC2)',
          'File Time Marks — diff-based per-file version tracking (warp / flashback / timejump / rewind), patches stored in DynamoDB and applied with difflib',
          'Chrono Capsules — full system-state snapshots you can create and switch between (clone / shift-capsule)',
          'Automated EC2 + EBS lifecycle — spins up an instance, polls status checks until healthy, tags and tracks the attached volume automatically',
          'Security layer: JWT auth, per-IP rate limiting, and CloudWatch logging of every login attempt (real-time threat monitoring)',
          'Built and benchmarked entirely within AWS Free Tier limits, unlike Git (no built-in cloud recovery) or plain Docker snapshots (no fine-grained file diffing)',
          'Ships two ways: a PyInstaller + Inno Setup Windows installer, or a Docker container',
        ],
        note: 'Every command referenced in-game — warp, snapshot, restore — is a real endpoint in the actual Flask API, not a mock. The Architecture Console in the dungeon is the real AWS pipeline from the project report, not a stand-in.',
        diagramSrc: '/archive/chrono-architecture.jpg',
        diagramAlt: 'ChronoCLI AWS architecture diagram: local save flows through EBS/S3 to System Manager, EC2, and Workspaces, with CloudWatch monitoring and Backup recovery running alongside.',
        installerSrc: '/downloads/chrono_installer.exe',
        installerLabel: 'Download Windows Installer (.exe)',
      },
    },
    {
      id: 'attendsmart',
      codename: 'AttendSmart',
      title: 'Automatic Attendance System',
      type: 'Location / Electric',
      summary: 'Self-initiated GPS-based attendance automation across mobile and web.',
      bullets: [
        'Created a location-based attendance system using GPS to automate presence tracking.',
        'Built a mobile/web app to eliminate manual errors through real-time geolocation validation.',
      ],
      stack: ['GPS', 'React', 'Firebase'],
      skillTags: ['ReactJS', 'Firebase', 'TypeScript'],
      archive: {
        techStack: ['React', 'TypeScript', 'Vite', 'Firebase Auth', 'Firestore', 'Google Maps API', 'Geolocation API', 'Tailwind CSS', 'Recharts'],
        features: [
          'Real-time GPS geofencing using the Haversine great-circle formula to verify a student is physically within a configurable radius of campus',
          'Timetable-aware attendance — only records a check during a genuinely ongoing class window, not just physical presence',
          'Live analytics dashboard with weekly, monthly, and subject-wise breakdowns',
          'Manual attendance entry for past dates, with duplicate-record prevention and absent-to-present correction',
          'Firebase Authentication + Firestore-backed data, with a documented mock-data fallback mode for demos',
          'Google Maps-based campus setup UI for visually configuring the geofence radius',
        ],
        note: 'The Perimeter and Standing Window consoles in the dungeon run the exact same distance and time-window functions as the real app \u2014 just without a live GPS signal or real class data, so anyone can try it safely.',
      },
    },
    {
      id: 'fedsecure',
      codename: 'FedSecure-MentalHealth',
      title: 'Multi-Agent Privacy-Orchestrated Framework for Secure Multimodal Federated Learning',
      type: 'Privacy / Psychic (BE Major Project · Team of 4)',
      summary: 'Federated learning system for mental health assessment across video, audio, and text.',
      bullets: [
        'Built a federated learning system for mental health assessment across video, audio, and text using MentalBERT, with a Rust gRPC orchestration server and Python client/aggregator agents implementing FedAvg, FedProx, SCAFFOLD, FedAdam, and FedYogi.',
        'Engineered a privacy and audit layer combining DP-SGD (Opacus, RDP accounting), AES-GCM encryption with HKDF key isolation, mTLS (RSA-4096), and an HMAC-chained tamper-evident audit ledger.',
      ],
      stack: ['MentalBERT', 'Rust', 'gRPC', 'Python', 'DP-SGD', 'AES-GCM', 'mTLS'],
      skillTags: ['Python'],
    },
  ] as ProjectEntry[],

  employment: [
    {
      period: 'May 2025 – Present',
      role: 'Intern',
      org: 'VESIT (College Project)',
      location: 'Chembur, India',
      bullets: [
        'Extracted and analyzed financial data from Tracxn, YouTube transcripts, and news sources for market insight generation.',
        'Built ML pipelines with DeepSeek, improving trend inference accuracy through research-driven feature engineering.',
      ],
      bossName: 'VESIT Research Lab',
      skillTags: ['Python', 'Pandas', 'NumPy'],
    },
    {
      period: 'July 2023 – September 2023',
      role: 'Intern',
      org: 'Academor',
      location: 'Virtual',
      bullets: [
        'Developed a machine learning-based loan prediction system aligned with efficiency and cost objectives.',
        'Defined project goals and established performance tracking for solution effectiveness.',
      ],
      bossName: 'Academor',
      skillTags: ['Python', 'scikit-learn'],
    },
  ] as EmploymentEntry[],

  certifications: [
    { year: '2025', name: 'AWS Academy Graduate', issuer: 'AWS' },
    { year: '2024', name: 'Networking Basics', issuer: 'Cisco' },
    { year: '2023', name: 'Computer Graphics', issuer: 'NPTEL' },
  ] as CertificationEntry[],

  skills: {
    languages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++'],
    libraries: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
    frameworks: ['TensorFlow', 'scikit-learn', 'Flask', 'ReactJS'],
    databases: ['MongoDB', 'Firebase', 'MySQL'],
    tools: ['Git', 'GitHub'],
    soft: ['Adaptability', 'Teamwork', 'Problem Solving', 'Communication'],
  },
}

export type VisitorMode = 'recruiter' | 'engineer' | 'curious' | 'exploring'

export const VISITOR_LINES: Record<VisitorMode, string> = {
  recruiter:
    "A promising Computer Engineer from Mumbai has been making waves.\nLet's see what they've built.",
  engineer:
    "Another builder, huh?\nYou'll probably want to see the systems and the code, not just the story.",
  curious:
    "Not everyone finds their way here on purpose.\nGlad you did. Let's take the scenic route.",
  exploring:
    "No agenda, no pressure.\nJust walk around and see what you find.",
}
