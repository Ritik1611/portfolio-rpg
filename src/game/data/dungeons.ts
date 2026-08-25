export interface DungeonConfig {
  projectId: string
  worldTitle: string
  guideName: string
  guideColor: string
  /** Lines shown right after the portal pulls the player in. */
  introLines: string[]
  /** Lines shown just before handing off to the React experience. */
  handoffLines: string[]
  /** Window event dispatched to open the React overlay experience. */
  openEventName: string
  /** Window event listened for when the React experience finishes. */
  exitEventName: string
  resolutionTitle: string
  resolutionLines: string[]
  bailLines: string[]
}

export const CHRONO_DUNGEON: DungeonConfig = {
  projectId: 'chrono-cli',
  worldTitle: 'THE CHRONO VAULT',
  guideName: 'LOG',
  guideColor: '#3f9a4b',
  introLines: [
    'The portal pulls you through a wall of shifting color.',
    'LOG: Connection established. ...You\u2019re not supposed\nto be able to do that.',
    'LOG: Welcome to the Vault. Every version of every file\nyou\u2019ve ever warped is still in here. Overlapping.',
  ],
  handoffLines: [
    'LOG: This Vault runs on the same engine as the real CLI.\nNo mock data \u2014 I\u2019m patching you into a live session.',
    'LOG: Work through the objectives, then bring the cloud\npipeline online. Come back when the timeline holds.',
  ],
  openEventName: 'open-chrono-terminal',
  exitEventName: 'chrono-experience-exit',
  resolutionTitle: 'TIMELINE STABILIZED',
  resolutionLines: ['LOG: ...Huh. It held.', 'LOG: Archive decrypted. Full project details unlocked\nin your Developer Journal.'],
  bailLines: ['LOG: Stepping back is fine. The Vault will still be\nhere when you\u2019re ready.'],
}

export const ATTEND_DUNGEON: DungeonConfig = {
  projectId: 'attendsmart',
  worldTitle: 'THE WAYPOINT',
  guideName: 'PIN',
  guideColor: '#e08a3c',
  introLines: [
    'The beacon doesn\u2019t pull you in so much as... place you.\nCarefully. Like it double-checked the coordinates first.',
    'PIN: Oh \u2014 someone real. Been a while.',
    'PIN: I\u2019m a marker. Was supposed to anchor to a campus,\nonce. Never quite landed. I\u2019ve been drifting since.',
  ],
  handoffLines: [
    'PIN: This place only answers to real presence \u2014 the same\ntwo checks the actual app runs. Distance, and timing.',
    'PIN: Prove you can be genuinely, verifiably somewhere.\nMaybe I can borrow the fix for myself.',
  ],
  openEventName: 'open-attend-console',
  exitEventName: 'attend-experience-exit',
  resolutionTitle: 'SIGNAL ANCHORED',
  resolutionLines: [
    'PIN: ...I have coordinates. Real ones.',
    'PIN: First fixed point I\u2019ve had in a long time. Thank you\n\u2014 the Waypoint\u2019s open. Your journal has the rest.',
  ],
  bailLines: ['PIN: No signal, no pressure. I\u2019ll still be drifting here\nwhenever you\u2019re ready to try again.'],
}
