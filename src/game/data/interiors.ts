export interface InteriorObject {
  id: string
  label: string
  lines: string[]
  clueId?: string
}

export interface InteriorRoom {
  id: string
  title: string
  flavorLine: string
  objects: InteriorObject[]
}

export const INTERIORS: Record<string, InteriorRoom> = {
  'player-home': {
    id: 'player-home',
    title: 'YOUR ROOM',
    flavorLine: 'Small, familiar, a little messy.',
    objects: [
      {
        id: 'desk',
        label: 'Desk',
        lines: [
          'A cluttered desk. Sticky notes everywhere.',
          'One says: "Gate code, first digit: 2.\nAlso \u2014 thanks for visiting, whoever you are."',
        ],
        clueId: 'home-note',
      },
      {
        id: 'bed',
        label: 'Bed',
        lines: ['Neatly made. Barely used during exam season.'],
      },
      {
        id: 'shelf',
        label: 'Bookshelf',
        lines: ['Textbooks, a few novels, and a suspicious amount of\nprintouts labeled "AWS Notes \u2014 FINAL \u2014 v3.pdf".'],
      },
    ],
  },
  'byte-lab': {
    id: 'byte-lab',
    title: "PROFESSOR BYTE'S LAB",
    flavorLine: 'Cables everywhere. Somehow, still organized.',
    objects: [
      {
        id: 'terminal',
        label: 'Terminal',
        lines: ['A terminal, mid-command.', '> whoami\nritik_shetty\n> echo $GATE_CODE_LAST_DIGIT\n6'],
        clueId: 'byte-notes',
      },
      {
        id: 'whiteboard',
        label: 'Whiteboard',
        lines: ['A whiteboard covered in architecture diagrams.\nMostly arrows. All of it apparently important.'],
      },
      {
        id: 'shelf',
        label: 'Certificates',
        lines: ['AWS. Cisco. NPTEL.\nEach one framed slightly crooked.'],
      },
    ],
  },
  'study-hall': {
    id: 'study-hall',
    title: 'STUDY HALL',
    flavorLine: 'Empty desks, old exam papers, the smell of stress.',
    objects: [
      {
        id: 'noticeboard',
        label: 'Notice Board',
        lines: [
          'A notice board thick with layers of old announcements.',
          'Someone\u2019s scrawled in the corner: "Gate code,\nsecond digit: 2. You\u2019re welcome."',
        ],
        clueId: 'study-notes',
      },
      {
        id: 'papers',
        label: 'Old Papers',
        lines: ['Stacks of graded papers. Red ink everywhere.\nMostly circles and question marks.'],
      },
    ],
  },
  'vertex-hall': {
    id: 'vertex-hall',
    title: 'VERTEX HALL',
    flavorLine: 'Lecture halls. One extremely loud vending machine.',
    objects: [
      {
        id: 'noticeboard',
        label: 'Notice Board',
        lines: ['Placement drive schedules, hackathon flyers,\nand a suspicious number of "FREE PIZZA" posters.'],
      },
      {
        id: 'vending',
        label: 'Vending Machine',
        lines: ['Out of order. Has been out of order since 2022.\nSomeone taped on a note: "still better uptime than my code."'],
      },
    ],
  },
  'research-lab': {
    id: 'research-lab',
    title: 'VESIT RESEARCH LAB',
    flavorLine: 'Servers humming, whiteboards full of pipelines.',
    objects: [
      {
        id: 'servers',
        label: 'Server Rack',
        lines: ['Blinking lights, quiet fans. Somewhere in here,\na DeepSeek model is still processing market data.'],
      },
      {
        id: 'whiteboard',
        label: 'Whiteboard',
        lines: ['CSV \u2192 Cleaning \u2192 DeepSeek \u2192 Feature Engineering \u2192 Predictions.\nThe whole pipeline, drawn out in dry-erase marker.'],
      },
    ],
  },
}
