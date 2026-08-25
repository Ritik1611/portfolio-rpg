import Phaser from 'phaser'
import { PROFILE } from '../../data/profile'

export type BattleType = 'systems' | 'cloud' | 'data'
export type BattleKind = 'gym' | 'exam' | 'practice' | 'wild' | 'project'

export interface BattleMove {
  id: string
  name: string
  type: BattleType
  flavor: string
  min: number
  max: number
  heal?: number
}

export interface BossAttack {
  name: string
  flavor: string
  min: number
  max: number
}

export interface BattleConfig {
  id: string
  kind: BattleKind
  bossName: string
  bossSubtitle: string
  bossHP: number
  accent: string
  iconStyle: 'bars' | 'flow' | 'bug' | 'book'
  weakness?: BattleType
  resist?: BattleType
  moves: BattleMove[]
  bossAttacks: BossAttack[]
  badgeName?: string
  victoryLines: string[]
  rewardPoints?: number
  /** Skill names (from PROFILE.skills) leveled up on victory. */
  skillTags?: string[]
  /** Extra entrance flourish for the one showcase-worthy encounter. */
  legendary?: boolean
  /** Slower, more forgiving timing windows + extra instructional lines. */
  tutorial?: boolean
}

// ── shared movesets ─────────────────────────────────────────────
export const DEBUG_MOVES: BattleMove[] = [
  { id: 'print', name: 'Print Statement', type: 'data', flavor: 'sprinkles console.logs everywhere', min: 7, max: 11 },
  { id: 'breakpoint', name: 'Set Breakpoint', type: 'systems', flavor: 'pauses and inspects the stack', min: 8, max: 13 },
  { id: 'search', name: 'Search Stack Overflow', type: 'cloud', flavor: 'finds a 7-year-old answer that still works', min: 9, max: 14 },
  { id: 'rewrite', name: 'Rewrite From Scratch', type: 'systems', flavor: 'nukes it and starts over', min: 12, max: 18 },
]

export const STUDY_MOVES: BattleMove[] = [
  { id: 'review', name: 'Review Notes', type: 'data', flavor: 'flips back through old notes', min: 8, max: 12 },
  { id: 'papers', name: 'Practice Papers', type: 'systems', flavor: 'works through a past paper', min: 10, max: 15 },
  { id: 'group', name: 'Study Group', type: 'cloud', flavor: 'compares answers with friends', min: 8, max: 12, heal: 4 },
  { id: 'focus', name: 'Deep Focus', type: 'systems', flavor: 'shuts everything else out', min: 12, max: 17 },
]

// ── gym battles (internships) ───────────────────────────────────
const academorJob = PROFILE.employment.find((e) => e.org === 'Academor')!
const vesitJob = PROFILE.employment.find((e) => e.org.includes('VESIT'))!

export const GYM_BATTLES: BattleConfig[] = [
  {
    id: 'academor',
    kind: 'gym',
    bossName: 'Loan Default Risk',
    bossSubtitle: 'Academor \u00b7 Loan Prediction Model',
    bossHP: 60,
    accent: '#ef476f',
    iconStyle: 'bars',
    weakness: 'cloud',
    resist: 'data',
    moves: [
      { id: 'train', name: 'Train Model', type: 'data', flavor: 'crunches the numbers', min: 10, max: 16 },
      { id: 'evaluate', name: 'Evaluate', type: 'systems', flavor: 'checks the metrics', min: 7, max: 11, heal: 4 },
      { id: 'deploy', name: 'Deploy', type: 'cloud', flavor: 'ships it to production', min: 14, max: 20 },
      { id: 'optimize', name: 'Optimize', type: 'systems', flavor: 'tunes the hyperparameters', min: 9, max: 13, heal: 3 },
    ],
    bossAttacks: [
      { name: 'Messy Data', flavor: 'throws null values everywhere', min: 6, max: 10 },
      { name: 'Overfitting', flavor: 'memorizes the training set', min: 8, max: 13 },
      { name: 'Deadline Pressure', flavor: 'moves the sprint up a week', min: 9, max: 15 },
    ],
    badgeName: 'Machine Learning Badge',
    victoryLines: ['Loan Default Risk stabilizes. The model holds.', ...academorJob.bullets],
    skillTags: academorJob.skillTags,
  },
  {
    id: 'vesit-lab',
    kind: 'gym',
    bossName: 'Data Chaos',
    bossSubtitle: 'VESIT Research Lab \u00b7 Market Data Pipeline',
    bossHP: 65,
    accent: '#38b764',
    iconStyle: 'flow',
    weakness: 'systems',
    resist: 'cloud',
    moves: [
      { id: 'clean', name: 'Clean Data', type: 'data', flavor: 'scrubs the CSV', min: 9, max: 14 },
      { id: 'feature', name: 'Feature Engineer', type: 'data', flavor: 'builds new signals', min: 12, max: 17 },
      { id: 'deepseek', name: 'Run DeepSeek', type: 'systems', flavor: 'lets the model loose', min: 16, max: 23 },
      { id: 'ship', name: 'Ship Insights', type: 'cloud', flavor: 'writes up the findings', min: 9, max: 13, heal: 4 },
    ],
    bossAttacks: [
      { name: 'Noisy Signals', flavor: 'buries the trend in noise', min: 6, max: 10 },
      { name: 'API Rate Limit', flavor: 'throttles the scraper', min: 8, max: 13 },
      { name: 'Schema Drift', flavor: 'renames every column overnight', min: 9, max: 15 },
    ],
    badgeName: 'Data Pipeline Badge',
    victoryLines: ['Data Chaos resolves into a clean trend line.', ...vesitJob.bullets],
    skillTags: vesitJob.skillTags,
  },
]

// ── exam battles (SSC / HSC) ────────────────────────────────────
const ssc = PROFILE.education.find((e) => e.detail === 'SSC')!
const hsc = PROFILE.education.find((e) => e.detail === 'HSC')!

export const EXAM_BATTLES: BattleConfig[] = [
  {
    id: 'ssc',
    kind: 'exam',
    bossName: 'Final Exam Stress',
    bossSubtitle: `SSC \u00b7 ${ssc.institution}`,
    bossHP: 45,
    accent: '#5a6988',
    iconStyle: 'book',
    weakness: 'data',
    moves: STUDY_MOVES,
    bossAttacks: [
      { name: 'Blank Mind', flavor: 'every answer disappears at once', min: 6, max: 10 },
      { name: 'Tight Deadline', flavor: 'the clock is louder than the room', min: 7, max: 12 },
    ],
    badgeName: `SSC \u00b7 ${ssc.result}`,
    victoryLines: ['The results are in.', `${ssc.institution} \u2014 ${ssc.result}.`],
    skillTags: ['Problem Solving', 'Adaptability'],
  },
  {
    id: 'hsc',
    kind: 'exam',
    bossName: 'Board Exam Pressure',
    bossSubtitle: `HSC \u00b7 ${hsc.institution}`,
    bossHP: 50,
    accent: '#5a6988',
    iconStyle: 'book',
    weakness: 'cloud',
    moves: STUDY_MOVES,
    bossAttacks: [
      { name: 'Silly Mistake', flavor: 'a careless slip on an easy question', min: 6, max: 11 },
      { name: 'Overthinking', flavor: 'second-guesses a right answer', min: 7, max: 12 },
    ],
    badgeName: `HSC \u00b7 ${hsc.result}`,
    victoryLines: ['The results are in.', `${hsc.institution} \u2014 ${hsc.result}.`],
    skillTags: ['Problem Solving', 'Adaptability'],
  },
]

export function findExam(id: string): BattleConfig {
  return EXAM_BATTLES.find((e) => e.id === id)!
}
export function findGym(id: string): BattleConfig {
  return GYM_BATTLES.find((g) => g.id === id)!
}
export function findProject(id: string): BattleConfig {
  return PROJECT_BATTLES.find((p) => p.id === id)!
}

// ── project encounters (self-initiated work) ────────────────────
const chronoCli = PROFILE.projects.find((p) => p.id === 'chrono-cli')!
const attendSmart = PROFILE.projects.find((p) => p.id === 'attendsmart')!
const fedSecure = PROFILE.projects.find((p) => p.id === 'fedsecure')!

export const PROJECT_BATTLES: BattleConfig[] = [
  {
    id: 'chrono-cli',
    kind: 'project',
    bossName: 'ChronoCLI',
    bossSubtitle: chronoCli.title,
    bossHP: 55,
    accent: '#5a6988',
    iconStyle: 'bars',
    weakness: 'cloud',
    resist: 'data',
    moves: [
      { id: 'snapshot', name: 'Snapshot State', type: 'systems', flavor: 'freezes an EBS snapshot in time', min: 10, max: 15 },
      { id: 'sync', name: 'Sync to S3', type: 'cloud', flavor: 'pushes the archive to the cloud', min: 13, max: 19 },
      { id: 'auth', name: 'Authenticate (JWT)', type: 'data', flavor: 'signs the request', min: 8, max: 12, heal: 4 },
      { id: 'restore', name: 'Restore Version', type: 'systems', flavor: 'rolls back to a known-good state', min: 11, max: 16 },
    ],
    bossAttacks: [
      { name: 'Version Conflict', flavor: 'two branches disagree on the truth', min: 6, max: 11 },
      { name: 'Corrupted Snapshot', flavor: 'a byte flips somewhere in EBS', min: 7, max: 12 },
      { name: 'Auth Token Expired', flavor: 'logs everyone out at once', min: 6, max: 10 },
    ],
    badgeName: 'Project Found \u00b7 ChronoCLI',
    victoryLines: [...chronoCli.bullets, 'ChronoCLI stabilizes. Every version, one command away.'],
    skillTags: chronoCli.skillTags,
  },
  {
    id: 'attendsmart',
    kind: 'project',
    bossName: 'AttendSmart',
    bossSubtitle: attendSmart.title,
    bossHP: 45,
    accent: '#ffcd75',
    iconStyle: 'flow',
    weakness: 'systems',
    resist: 'cloud',
    moves: [
      { id: 'gps', name: 'GPS Check', type: 'systems', flavor: 'pins the exact location', min: 9, max: 14 },
      { id: 'geofence', name: 'Geofence Validate', type: 'data', flavor: 'confirms the boundary', min: 10, max: 15 },
      { id: 'sync', name: 'Sync Firebase', type: 'cloud', flavor: 'writes the record live', min: 8, max: 12, heal: 4 },
      { id: 'notify', name: 'Push Notification', type: 'systems', flavor: 'pings the right device', min: 11, max: 16 },
    ],
    bossAttacks: [
      { name: 'Signal Drift', flavor: 'GPS wanders a few meters off', min: 5, max: 9 },
      { name: 'Battery Drain', flavor: 'background location tracking adds up', min: 6, max: 10 },
      { name: 'False Positive', flavor: 'marks someone present who isn\u2019t', min: 6, max: 11 },
    ],
    badgeName: 'Project Found \u00b7 AttendSmart',
    victoryLines: [...attendSmart.bullets, 'Manual errors drop to zero. Attendance, automated.'],
    skillTags: attendSmart.skillTags,
  },
  {
    id: 'fedsecure',
    kind: 'project',
    bossName: 'FedSecure-MentalHealth',
    bossSubtitle: fedSecure.title,
    bossHP: 85,
    accent: '#7c5cff',
    iconStyle: 'flow',
    weakness: 'data',
    resist: 'systems',
    legendary: true,
    moves: [
      { id: 'aggregate', name: 'Federated Aggregate', type: 'systems', flavor: 'merges five strategies into one model', min: 12, max: 18 },
      { id: 'encrypt', name: 'Encrypt Payload (AES-GCM)', type: 'data', flavor: 'seals the data in transit', min: 14, max: 20 },
      { id: 'privacy', name: 'Differential Privacy (DP-SGD)', type: 'cloud', flavor: 'adds calibrated noise to protect identities', min: 9, max: 13, heal: 5 },
      { id: 'audit', name: 'Audit Ledger Check', type: 'systems', flavor: 'verifies the HMAC chain, tamper-free', min: 13, max: 19 },
    ],
    bossAttacks: [
      { name: 'Privacy Leak Risk', flavor: 'a gradient reveals more than it should', min: 8, max: 13 },
      { name: 'Non-IID Drift', flavor: 'every client\u2019s data looks completely different', min: 9, max: 14 },
      { name: 'Byzantine Node', flavor: 'one aggregator agent stops cooperating', min: 10, max: 15 },
    ],
    badgeName: 'Project Found \u00b7 FedSecure-MentalHealth',
    victoryLines: [...fedSecure.bullets, 'Every tower reconnects. FedSecure holds.'],
    skillTags: fedSecure.skillTags,
  },
]

// ── tutorial battle (opening cutscene) ───────────────────────────
export const TUTORIAL_BATTLE: BattleConfig = {
  id: 'tutorial',
  kind: 'practice',
  tutorial: true,
  bossName: 'Practice Target',
  bossSubtitle: 'Just a warm-up \u2014 nothing to lose here',
  bossHP: 22,
  accent: '#5a6988',
  iconStyle: 'bug',
  moves: DEBUG_MOVES,
  bossAttacks: [{ name: 'Gentle Jab', flavor: 'barely even tries', min: 4, max: 7 }],
  victoryLines: ["That's the whole system \u2014 attack, brace, repeat.", 'Harmony Village is just ahead.'],
}

// ── Kavi's practice spar (village tutorial) ─────────────────────
export const KAVI_PRACTICE: BattleConfig = {
  id: 'kavi-practice',
  kind: 'practice',
  bossName: "Kavi's Deadline Panic",
  bossSubtitle: 'Friendly sparring match',
  bossHP: 40,
  accent: '#38b764',
  iconStyle: 'bars',
  weakness: 'data',
  moves: DEBUG_MOVES,
  bossAttacks: [
    { name: '"It Works On My Machine"', flavor: 'shrugs and moves on', min: 5, max: 9 },
    { name: 'Scope Creep', flavor: 'adds one more feature', min: 6, max: 10 },
  ],
  victoryLines: ["Nice! You've got the hang of it.", 'Go show the actual gym leaders what you can do.'],
  rewardPoints: 10,
}

// ── wild bug encounters (village grass) ─────────────────────────
const BUG_NAMES = ['NullPointerException', 'Off-By-One Error', 'Race Condition', 'Merge Conflict', 'Infinite Loop', 'Memory Leak', 'Flaky Test']
const BUG_TYPES: BattleType[] = ['systems', 'cloud', 'data']

export function generateWildBugConfig(): BattleConfig {
  const name = BUG_NAMES[Phaser.Math.Between(0, BUG_NAMES.length - 1)]
  const weakness = BUG_TYPES[Phaser.Math.Between(0, BUG_TYPES.length - 1)]
  return {
    id: `wild-${Date.now()}`,
    kind: 'wild',
    bossName: name,
    bossSubtitle: 'Wild Bug',
    bossHP: Phaser.Math.Between(22, 34),
    accent: '#5a6988',
    iconStyle: 'bug',
    weakness,
    moves: DEBUG_MOVES,
    bossAttacks: [
      { name: 'Stack Trace', flavor: 'buries you in red text', min: 4, max: 8 },
      { name: 'Silent Failure', flavor: 'fails without telling you why', min: 5, max: 9 },
    ],
    victoryLines: [`${name} squashed.`],
    rewardPoints: Phaser.Math.Between(6, 11),
  }
}
