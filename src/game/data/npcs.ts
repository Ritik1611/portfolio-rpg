import type { ActorPalette } from '../gfx/pixelActor'
import type { SaveData } from '../config'
import { PROFILE } from '../../data/profile'

export const PALETTES: Record<string, ActorPalette> = {
  player: {
    skin: '#e8b98a',
    hair: '#5a3a22',
    outfit: '#3d6fd6',
    accent: '#ffcd75',
    pants: '#26314f',
  },
  byte: {
    skin: '#e2ac7d',
    hair: '#e9e9ef',
    outfit: '#f4f1ea',
    accent: '#5a6988',
    pants: '#3a3f5c',
    accessory: 'glasses',
    accessoryColor: '#1a1c2c',
  },
  mom: {
    skin: '#e8b98a',
    hair: '#9a3b4a',
    outfit: '#d97757',
    accent: '#f4e9d8',
    pants: '#7a4a3a',
    accessory: 'bow',
    accessoryColor: '#ffcd75',
  },
  kavi: {
    skin: '#c98a5e',
    hair: '#1a1c2c',
    outfit: '#38b764',
    accent: '#ffcd75',
    pants: '#22303f',
    accessory: 'cap',
    accessoryColor: '#ef476f',
  },
  priya: {
    skin: '#e8b98a',
    hair: '#3a2a5c',
    outfit: '#2f8f8f',
    accent: '#ffcd75',
    pants: '#22303f',
    accessory: 'bow',
    accessoryColor: '#ef476f',
  },
  guide: {
    skin: '#c98a5e',
    hair: '#1a1c2c',
    outfit: '#29366f',
    accent: '#ef476f',
    pants: '#1a1c2c',
    accessory: 'cap',
    accessoryColor: '#f4e9d8',
  },
  lina: {
    skin: '#e2ac7d',
    hair: '#7a2f2f',
    outfit: '#ef476f',
    accent: '#f4e9d8',
    pants: '#3a1f1f',
  },
  renn: {
    skin: '#c98a5e',
    hair: '#1a1c2c',
    outfit: '#eef2f5',
    accent: '#38b764',
    pants: '#2a3a3a',
    accessory: 'glasses',
    accessoryColor: '#1a1c2c',
  },
  proctor: {
    skin: '#e8b98a',
    hair: '#3a3f5c',
    outfit: '#5a6988',
    accent: '#f4e9d8',
    pants: '#1a1c2c',
    accessory: 'glasses',
    accessoryColor: '#1a1c2c',
  },
}

function timeGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'burning the midnight oil, huh?'
  if (h < 12) return 'good morning!'
  if (h < 17) return 'good afternoon!'
  if (h < 21) return 'good evening!'
  return 'still up? respect.'
}

export interface StaticNPC {
  id: string
  name: string
  x: number
  y: number
  kind: 'actor' | 'sign'
  palette: ActorPalette
  facing: 'down' | 'up' | 'left' | 'right'
  /** Clue id granted the first time this NPC is talked to. */
  grantsClue?: string
  getLines: (save: SaveData, visitCount: number) => string[]
}

export const MOM_LINES_FIRST = [
  `Oh — a visitor! ${timeGreeting()}`,
  "I'm just tending the garden while my kid is off building things.",
  'They get so absorbed in a project they forget to eat.\nSome things never change.',
  "Before you head off — the Hall Monitor's gate code needs a\nsecond digit. It's 0.",
]

const MOM_LINES_REPEAT = [
  ['Back again? The garden missed you.', "Still growing — mostly bugs, unfortunately.\nThe six-legged kind, thankfully."],
  ['Remember to commit your changes.\n...I may have heard that phrase a lot.', 'Take a break if you need one. The code will wait.'],
  ["Vertex City is just past the square.\nThat's where most of the real work happened.", 'Would you like some tea? ...I have no way of actually giving you tea.'],
]

const KAVI_INTRO = [
  'Oh hey! You made it to Harmony Village.',
  "I'm Kavi — I've been debugging this village's fence collisions since forever.",
]

function kaviRoleLine(save: SaveData): string {
  switch (save.visitorMode) {
    case 'recruiter':
      return "A recruiter, huh? Don't worry, I'll keep the small talk short —\nRitik's work speaks for itself. Go check the Trainer Card (press T)."
    case 'engineer':
      return "An engineer! Then you'll actually appreciate this —\nFedSecure-MentalHealth runs FIVE different federated learning strategies. Five."
    case 'curious':
      return "Curious is a good way to be.\nThis whole village exists because someone got curious about a résumé."
    default:
      return 'No agenda? Honestly, that might be the best way to see this place.'
  }
}

export const NPCS: StaticNPC[] = [
  {
    id: 'mom',
    name: 'Mom',
    x: 152,
    y: 248,
    kind: 'actor',
    palette: PALETTES.mom,
    facing: 'down',
    grantsClue: 'mom-blessing',
    getLines: (_save, visitCount) => {
      if (visitCount === 0) return MOM_LINES_FIRST
      return MOM_LINES_REPEAT[(visitCount - 1) % MOM_LINES_REPEAT.length]
    },
  },
  {
    id: 'kavi',
    name: 'Kavi',
    x: 216,
    y: 296,
    kind: 'actor',
    palette: PALETTES.kavi,
    facing: 'left',
    grantsClue: 'kavi-tips',
    getLines: (save, visitCount) => {
      if (visitCount === 0)
        return [...KAVI_INTRO, kaviRoleLine(save), 'One tip before you go \u2014 the gate code\u2019s third digit is 2.\nDon\u2019t ask how I know.', 'Actually — wanna spar? Nothing official, just practice.']
      return [
        kaviRoleLine(save),
        `${PROFILE.projects.length} projects, ${PROFILE.certifications.length} certifications, and counting.\nNot bad for someone who "just codes as a hobby."`,
        'Up for another practice round?',
      ]
    },
  },
  {
    id: 'signpost',
    name: 'Signpost',
    x: 168,
    y: 264,
    kind: 'sign',
    palette: PALETTES.player,
    facing: 'down',
    getLines: () => [
      'HARMONY VILLAGE\n"Where the journey begins."',
      'Arrows to move · Enter to talk · T for Trainer Card',
      'Step into the flowers if you dare \u2014\nbugs live there.',
    ],
  },
  {
    id: 'pond-sign',
    name: 'Pond Plaque',
    x: 472,
    y: 88,
    kind: 'sign',
    palette: PALETTES.player,
    facing: 'down',
    getLines: () => ['HARMONY POND', "Local legend says a rubber duck fell in here once.\nIt has not been found."],
  },
  {
    id: 'route-sign',
    name: 'Route Sign',
    x: 664,
    y: 152,
    kind: 'sign',
    palette: PALETTES.player,
    facing: 'down',
    getLines: () => ["SCHOLAR'S ROUTE", 'The path toward HSC. Keep to the road\nand mind the trees.'],
  },
  {
    id: 'priya',
    name: 'Priya',
    x: 808,
    y: 152,
    kind: 'actor',
    palette: PALETTES.priya,
    facing: 'down',
    grantsClue: 'priya-notes',
    getLines: (_save, visitCount) => {
      if (visitCount === 0) {
        return [
          "Whew — Scholar's Route. Longer than it looks on the résumé.",
          'Two years at Sathaye College of Science.\n82%, if you\u2019re counting. I was counting.',
          'That proctor ahead wants a two-digit code.\nFirst digit: 8. The study hall might have the rest.',
          'Keep walking east — Vertex City is where things really pick up.',
        ]
      }
      return ["Still here. Still counting percentages, apparently.", "Vertex City's got the good stuff — internships, projects, all of it."]
    },
  },
  {
    id: 'campus-guide',
    name: 'Campus Guide',
    x: 1128,
    y: 248,
    kind: 'actor',
    palette: PALETTES.guide,
    facing: 'down',
    getLines: (save, visitCount) => {
      const cgpa = PROFILE.education[0].result.replace('CGPA ', '')
      if (visitCount === 0) {
        return [
          "Welcome to Vertex City — home of Vivekanand Education\nSociety's Institute of Technology.",
          `Computer Engineering, ${PROFILE.education[0].years}. Current CGPA: ${cgpa}.\nStill in progress, still climbing.`,
          'Two internships turned into real Gym Battles.\nVertex Hall and the Research Lab, both nearby.',
          "There's also something in the plaza worth investigating.\nThree somethings, actually.",
        ]
      }
      const badgeCount = ['academor', 'vesit-lab'].filter((id) => save.badges.includes(id)).length
      if (badgeCount === 2) {
        return [`CGPA's still ${cgpa} last I checked.`, 'Both internship badges collected. Nicely done.']
      }
      return [`CGPA's still ${cgpa} last I checked.`, 'The gym leaders are waiting by their buildings, if you\u2019re ready.']
    },
  },
  {
    id: 'city-tease-sign',
    name: 'Construction Sign',
    x: 1368,
    y: 152,
    kind: 'sign',
    palette: PALETTES.player,
    facing: 'down',
    getLines: () => ['VERTEX CITY — EASTERN DISTRICT', 'The full ProjectDex and an ending sequence\nare still being wired up.'],
  },
]

export const BYTE = {
  id: 'byte',
  name: 'Professor Byte',
  x: 328,
  y: 168,
  palette: PALETTES.byte,
  facing: 'down' as const,
}

export interface GymLeaderNPC {
  id: string
  name: string
  x: number
  y: number
  palette: ActorPalette
  facing: 'down' | 'up' | 'left' | 'right'
  battleId: string
  introLines: string[]
  returnLines: string[]
}

export const GYM_LEADERS: GymLeaderNPC[] = [
  {
    id: 'gym-lina',
    name: 'Coach Lina',
    x: 1128,
    y: 136,
    palette: PALETTES.lina,
    facing: 'down',
    battleId: 'academor',
    introLines: [
      "Coach Lina, Academor. I ran the loan prediction challenge remotely —\nstill do, actually.",
      'Loan Default Risk is still out there causing problems.\nThink you can handle it?',
    ],
    returnLines: ['Machine Learning Badge, already on your journal.', 'Want a rematch? Just for fun this time.'],
  },
  {
    id: 'gym-renn',
    name: 'Dr. Renn',
    x: 1272,
    y: 136,
    palette: PALETTES.renn,
    facing: 'down',
    battleId: 'vesit-lab',
    introLines: [
      'Dr. Renn, VESIT Research Lab. Market data pipelines, mostly —\nTracxn, transcripts, news, all of it.',
      "Data Chaos is what we call it when the pipeline breaks.\nCare to fix it?",
    ],
    returnLines: ['Data Pipeline Badge, already earned.', 'Go again? The chaos regenerates for practice.'],
  },
]

export interface ExamGateNPC {
  id: string
  name: string
  x: number
  y: number
  palette: ActorPalette
  facing: 'down' | 'up' | 'left' | 'right'
  battleId: string
  requiredClues: string[]
  lockedLine: string
  readyLine: string
  code: string
  barrierX: number
  barrierY: number
  introLines: string[]
  returnLines: string[]
}

export const CLUE_HINTS: Record<string, string> = {
  'home-note': 'See what\u2019s inside your house.',
  'mom-blessing': 'Say goodbye to Mom before you go.',
  'kavi-tips': 'Kavi still owes you some advice.',
  'byte-notes': 'There\u2019s something inside Professor Byte\u2019s lab worth reading.',
  'priya-notes': 'Talk to Priya before continuing east.',
  'study-notes': 'Check the notice board inside the Study Hall.',
}

export const EXAM_GATES: ExamGateNPC[] = [
  {
    id: 'gate-ssc',
    name: 'Hall Monitor',
    x: 616,
    y: 152,
    palette: PALETTES.proctor,
    facing: 'down',
    battleId: 'ssc',
    requiredClues: ['home-note', 'mom-blessing', 'kavi-tips', 'byte-notes'],
    lockedLine: 'This gate needs a 4-digit code. Ask around \u2014\nyou\u2019re missing:',
    readyLine: 'You\u2019ve got every piece. Enter the code:',
    code: '2026',
    barrierX: 648,
    barrierY: 168,
    introLines: [
      'Before you leave the village — final exams.\nEveryone goes through this gate.',
      'Nothing personal. Just the standard Final Exam Stress.\nReady?',
    ],
    returnLines: ['SSC result already on record.', 'Feel free to walk on through.'],
  },
  {
    id: 'gate-hsc',
    name: 'Board Exam Proctor',
    x: 984,
    y: 152,
    palette: PALETTES.proctor,
    facing: 'down',
    battleId: 'hsc',
    requiredClues: ['priya-notes', 'study-notes'],
    lockedLine: 'This gate needs a code too. Ask around \u2014\nyou\u2019re missing:',
    readyLine: 'Got the code? Enter it:',
    code: '82',
    barrierX: 1032,
    barrierY: 168,
    introLines: [
      'Board exams. Two years of Scholar\u2019s Route come down to this.',
      'Board Exam Pressure is waiting on the other side of this gate.\nReady?',
    ],
    returnLines: ['HSC result already on record.', 'Vertex City is right ahead.'],
  },
]

export interface HouseDoor {
  id: string
  name: string
  x: number
  y: number
  roomId: string
}

export const HOUSE_DOORS: HouseDoor[] = [
  { id: 'home-door', name: 'Home', x: 104, y: 232, roomId: 'player-home' },
  { id: 'byte-lab-door', name: "Byte's Lab", x: 328, y: 152, roomId: 'byte-lab' },
  { id: 'study-hall-door', name: 'Study Hall', x: 904, y: 136, roomId: 'study-hall' },
  { id: 'vertex-hall-door', name: 'Vertex Hall', x: 1128, y: 120, roomId: 'vertex-hall' },
  { id: 'research-lab-door', name: 'Research Lab', x: 1272, y: 120, roomId: 'research-lab' },
]

export interface ProjectMarker {
  id: string
  name: string
  x: number
  y: number
  kind: 'portal' | 'crest'
  discoveryLine: string
  foundLine: string
}

export const PROJECT_MARKERS: ProjectMarker[] = [
  {
    id: 'chrono-cli',
    name: 'Shimmering Portal',
    x: 1096,
    y: 264,
    kind: 'portal',
    discoveryLine: 'A portal hangs in the air, folding light in on\nitself. It feels like ChronoCLI \u2014 like time, bent.',
    foundLine: 'The portal still hums, quieter now.\nThe timeline inside is stable.',
  },
  {
    id: 'attendsmart',
    name: 'Drifting Beacon',
    x: 1352,
    y: 264,
    kind: 'portal',
    discoveryLine: 'A small beacon hovers here, checking a location\nagainst a boundary that keeps almost forming.',
    foundLine: 'The beacon holds steady now. Signal anchored.\nAttendSmart, already logged in your journal.',
  },
  {
    id: 'fedsecure',
    name: 'Humming Array',
    x: 1208,
    y: 280,
    kind: 'crest',
    discoveryLine: 'Five towers of light hum in the distance,\nsynchronizing without ever touching. FedSecure.',
    foundLine: 'The array hums on, quiet and encrypted.\nFedSecure, already logged in your journal.',
  },
]

export { timeGreeting }
