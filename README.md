# Ritik Shetty — The Journey

An interactive, retro-RPG-style portfolio. Instead of scrolling a résumé, the visitor
walks through a small GBA-style world, talks to characters, fights real turn-based
battles for every milestone — school, internships, and now the actual projects — and
picks up an instant "Trainer Card" summary along the way, always one keypress away
for people in a hurry.

Built with **Vite + React + TypeScript + Phaser 3**, exactly as requested.

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL. **Arrow keys / WASD** to move, **Enter** to talk,
**T** for the Trainer Card, **Esc** for the menu. In battle: pick a move with
arrow keys + Enter, then time your **ENTER** press against the sweeping
meter — that's what actually determines your damage. Press **Esc** to leave
any fight (no real "lose" state).

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## What's implemented right now (Phase 1 through 10)

**Phase 1 — foundation**
- Full Vite + React + TypeScript + Phaser 3 scaffold, cleanly separated:
  Phaser owns the game canvas (`src/game`), React owns overlay UI (`src/ui`).
- **Save system**: `localStorage`-backed, typed, survives refresh.
- **Trainer Card**: a React overlay rendering your résumé — education,
  projects, employment, certifications, skills — from `src/data/profile.ts`,
  with working Download Résumé / LinkedIn / GitHub / Contact buttons.
- **Speedrun** menu option jumps straight to the Trainer Card.

**Phase 2 — Harmony Village: a walkable world with real characters**
- A hand-built, tile-based village — camera-follow, collision, trees, a pond,
  fences, two houses — all **procedurally generated pixel art**, no external
  image files, no copyrighted assets (see `src/game/gfx/`).
- **Professor Byte** — walk up to him to trigger name entry + visitor-role
  selection, instead of a forced cutscene. **Mom** and **Kavi** are recurring
  NPCs with rotating/contextual dialogue.

**Phase 3 — Scholar's Route & Vertex City: the world gets 3x bigger**
- The road east runs through a tree-lined corridor (**Scholar's Route**, HSC)
  into a second hub (**Vertex City**, VESIT). Total world: **90×24 tiles**,
  three connected regions, one continuous scene.
- **Priya** and **Campus Guide** reference your real percentages, course,
  years, and CGPA straight from `profile.ts`.

**Phase 4 — Real turn-based battles**
- Walk into **flower patches** for a chance wild-bug ambush (rewards Debug
  Points, tracked live in the HUD). **Kavi** offers a practice spar any time.
- **Two Gym Battles** in Vertex City, one per internship — **Coach Lina**
  (Academor, boss "Loan Default Risk") and **Dr. Renn** (VESIT Research Lab,
  boss "Data Chaos") — with movesets themed around the real work.
- **SSC and HSC are battles too**, gated by an NPC at each region border
  ("Hall Monitor," "Board Exam Proctor") — beat "Final Exam Stress" or "Board
  Exam Pressure" and your real percentage (93% / 82%) is revealed as the
  reward. No invented personal anecdotes anywhere — bosses are always
  universal obstacles, never a fabricated quote or memory.
- **Real timing-based Action Commands** (`src/game/objects/TimingMeter.ts`),
  Mario & Luigi / Paper Mario style. Every attack requires pressing ENTER as
  a sweeping marker crosses a target zone — miss it and your hit is weak;
  land it perfectly and it's a big one. Every incoming boss attack has the
  same mechanic in reverse: brace at the right moment to block most of the
  damage. It's not menu-select-and-wait anymore — every exchange needs an
  actual reflex.
- **Type effectiveness, crits, heals, tweened HP bars, floating damage,
  camera shake**, and a flee option (Esc) on every fight.
- **Skills level up for real**, tied to `skillTags` on each résumé entry —
  never invented, always pulled from the actual Skills section. Shows as a
  toast in-world and a "Lv.N" tag in the Trainer Card, which now reads live
  save data.

**Phase 5 — Project encounters**
- Three discovery markers now sit in the Vertex City plaza — a weathered
  terminal, a blinking beacon, a humming array — each hiding one of your
  real projects. Walk up, investigate, and fight:
  - **ChronoCLI** — moves themed on its actual stack: Snapshot State, Sync
    to S3, Authenticate (JWT), Restore Version.
  - **AttendSmart** — GPS Check, Geofence Validate, Sync Firebase, Push
    Notification.
  - **FedSecure-MentalHealth** — the showcase encounter (`legendary: true`
    in `battles.ts`), a tougher fight with a bigger crest, a gold ring, and
    a screen flash on entrance: Federated Aggregate, Encrypt Payload
    (AES-GCM), Differential Privacy (DP-SGD), Audit Ledger Check.
  - Victory lines are your real résumé bullets for that project, and
    beating one for the first time levels up its tagged skills (e.g.
    ChronoCLI → MongoDB, FedSecure → Python) and marks it "✓ Found in-game"
    on its Trainer Card entry.

**Phase 6 — A real opening, enterable houses, and escape-room progression**
- **"Begin Adventure" now opens with a proper cutscene.** Professor Byte
  appears automatically — no walking required — asks your name and why
  you're here, then runs you through a **tutorial battle** (forgiving timing
  windows, extra on-screen explanation of attack/brace) before the village
  even loads. Returning players who've already done this skip straight to
  the village.
- **Houses are enterable.** Your home and Professor Byte's lab each open
  into a small interior (`InteriorScene`, data-driven via
  `src/game/data/interiors.ts`) where you examine furniture for flavor text
  — and clues.
- **NPCs are no longer optional flavor — they gate your progress.** The
  Hall Monitor at the village exit won't offer the SSC exam until you've
  collected all four clues scattered around Harmony Village (your desk, Mom,
  Kavi, Professor Byte's lab); if you're missing any, it tells you exactly
  which. Scholar's Route works the same way with Priya before the HSC gate.
  This is the escape-room structure: talk to everyone, check every room,
  *then* you can leave.
- **Wild encounters are rarer and clearly telegraphed.** Chance dropped from
  15% to 6% per flower tile, cooldown up from 3s to 7s, and every encounter
  now opens with a sharp red "⚠ WILD ENCOUNTER!" banner and a screen shake
  before the fight begins — no more sudden unexplained battle-scene jumps.
- **Clues assemble into an actual code, and the gate is physically locked.**
  Each of the four clues in Harmony Village reveals one digit; combine them
  and enter the code at the Hall Monitor's gate (a real keypad-style
  `CodeEntry` prompt) to open it. The gate itself is a solid physics barrier
  spanning the full width of the map — there's no grass to sneak around it
  on, so skipping the puzzle by walking past the NPC isn't possible anymore.
  Scholar's Route works the same way with a 2-digit code from Priya. Wrong
  code shakes and clears; Escape backs out without penalty.
- **Every character has a visible name.** A name tag floats above every NPC
  in the world, and the dialogue box now shows a name plate for whoever's
  talking — no more guessing who "the person by the garden" is.

**Phase 7 — Fixed the Main Menu, expanded the escape-room template**
- **Main Menu bug fixed**: selecting Speedrun / Trainer Card / Settings used
  to destroy the menu and never rebuild it, leaving a blank screen once you
  closed the overlay. The menu now rebuilds itself after every non-navigating
  selection.
- **Three more enterable interiors**, wired up with zero changes to
  `VillageScene.ts` — the door/interior system built in Phase 6 turned out
  to be fully data-driven, so this was purely additive:
  - **Study Hall** (new building on Scholar's Route) — its notice board
    holds the second half of the HSC gate code.
  - **Vertex Hall** and **Research Lab** in Vertex City — flavor and lore
    for both internships (no puzzle gating here, just more to explore).
- **The HSC code is a real two-source puzzle now**, not one NPC handing you
  the whole answer. Priya gives the first digit, the Study Hall's notice
  board gives the second — you need both.

**Phase 8 — Fixed menu focus, and ChronoCLI got a real dungeon**
- **Menu focus bug fixed properly**: the cursor now remembers which option
  was last selected across rebuilds, so opening Settings and closing it
  doesn't silently snap the highlight back to "Begin Adventure."
- **ChronoCLI is a portal now, not a battle marker.** Interacting with it
  teleports you into **the Chrono Vault**, a short linear dungeon narrated
  by LOG — a personification of the project's own CloudWatch security
  logger:
  - **The Warp Gate** — a puzzle built from a genuine bug in the real
    source: `app.py` defines `apply_patch()` twice. The puzzle asks which
    definition actually executes (Python keeps the last one — a real,
    useful thing to understand about the language, not a made-up riddle).
  - **The Snapshot Chamber** — try to restore before you've snapshotted
    and LOG quotes the actual API error string from `restore_ebs_snapshot()`
    back at you: `"No snapshot found. Please create one first."`
  - **The Capsule Core** — a boss fight reusing ChronoCLI's existing
    battle config (Snapshot State / Sync to S3 / Authenticate / Restore
    Version), framed as stabilizing the timeline.
  - Beating it awards the project badge, levels up Python / Flask / MongoDB,
    and unlocks a new **Archive** overlay — a rich, scrollable panel
    (`ProjectArchive.tsx`) showing ChronoCLI's real tech stack and feature
    list, reachable again any time from the Trainer Card.
**Phase 9 — ChronoCLI is a real, working demo now, not a scripted encounter**
- Replaced the diff-quiz / snapshot-quiz / boss-battle sequence entirely.
  Two reasons: it still played like "read text, time a button press," and
  more importantly, none of it was the actual project — just a game about
  the project.
- **The Chrono Terminal** (`ChronoTerminal.tsx`) is a real, working
  simulation of the CLI's versioning engine, not scripted output. Type
  `edit`, `warp`, `flashback`, `snapshot`, `timejump` and get back genuinely
  computed results — `flashback` runs a real LCS line-diff
  (`src/ui/lib/diff.ts`) against whatever text you actually typed. No AWS
  credentials involved anywhere; it's a client-side simulation by design,
  since sharing real cloud secrets in a public portfolio isn't something
  anyone should do.
- **The Architecture Console** replaces the battle entirely. It's the real
  AWS pipeline from the project report and diagram — CloudWatch → Lock →
  Backup, and EBS → S3 → Systems Manager → EC2 → Workspaces → DataSync —
  rendered as a real dependency-ordered activation puzzle. Click ahead of
  order and it tells you exactly what's missing, using the real service
  names.
- **The Archive overlay now shows the real thing**: the actual architecture
  diagram image, a real downloadable Windows installer
  (`public/downloads/chrono_installer.exe`), and a feature list pulled from
  the real project report — three-layer architecture, free-tier
  engineering constraints, security/monitoring layer, the works.
**Phase 10 — AttendSmart got its own dungeon, and the engine is now shared**
- **Refactored `DungeonScene` into a generic, config-driven engine**
  (`src/game/data/dungeons.ts`). The portal-pull framing, the guide's
  dialogue, and the React handoff are shared plumbing now — but every
  dungeon's actual story, guide character, and puzzle mechanic is authored
  fresh per project, on purpose, so this doesn't turn into a reskinned
  template. ChronoCLI kept LOG and the terminal; AttendSmart is a
  completely different world.
- **AttendSmart's dungeon is "The Waypoint"**, guided by PIN — a GPS
  marker that never anchored to a real campus and has been drifting since.
  No terminal here; it's a map-based console because that's what the real
  project actually is.
- **The Perimeter** is a real, working geofence: drag a pin around a field,
  and the distance readout is computed by the actual Haversine formula
  ported line-for-line from AttendSmart's own `attendanceService.ts`
  (`src/ui/lib/geo.ts`). Move the radius slider and watch present/absent
  flip in real time.
- **The Standing Window** surfaces a genuinely interesting real system
  behavior as the plot's turning point: being on campus isn't enough —
  attendance only records during an actual scheduled class window. A time
  slider against a sample timetable demonstrates this directly, and a
  "Run Live Check" button combines both real functions — location and
  time — exactly like the app's actual `checkAttendance()` does.
- **No real GPS or Maps API calls anywhere.** Same principle as ChronoCLI's
  terminal: real logic, simulated backend, safe for anyone to try.
- **FedSecure is untouched for now** — still the simpler crest-battle
  encounter from Phase 5, waiting on its source and materials.

Everything content-related lives in **`src/data/profile.ts`** (résumé, with
`skillTags` linking projects/jobs to real listed skills) and
**`src/game/data/npcs.ts`** / **`src/game/data/battles.ts`** (characters,
dialogue, battle configs, project markers). Edit any of them and the game
updates everywhere that uses them.

## Project structure

```
src/
├── data/
│   └── profile.ts          # résumé content + skillTags for skill leveling
├── game/
│   ├── config.ts             # constants, save types (badges, projectsFound, skillLevels, debugPoints)
│   ├── Game.ts                # Phaser game factory / scene registration
│   ├── gfx/
│   │   ├── pixelActor.ts      # procedural character sprite + portrait generator
│   │   ├── tileset.ts         # procedural tile + signpost texture generator
│   │   ├── mapBuilder.ts      # the 90x24 three-region map layout
│   │   └── battleArt.ts       # procedural battle-crest icon generator
│   ├── data/
│   │   ├── npcs.ts            # NPCs, gym leaders, exam gates, house doors, clue hints
│   │   ├── battles.ts         # move sets, boss configs, type effectiveness
│   │   └── interiors.ts       # house interior room + examine-object definitions
│   ├── objects/
│   │   ├── DialogueBox.ts     # typewriter dialogue box with portrait support
│   │   ├── ChoiceMenu.ts      # keyboard + pointer navigable menu
│   │   ├── TimingMeter.ts     # Action-Command timing mini-game (attack + defend)
│   │   └── AchievementToast.ts# badge / level-up / clue-found / wild-alert toasts
│   ├── systems/
│   │   └── WelcomeConversation.ts  # name entry + visitor-role flow (Prof. Byte)
│   └── scenes/
│       ├── BootScene.ts
│       ├── PreloadScene.ts
│       ├── MainMenuScene.ts
│       ├── OpeningScene.ts    # cutscene: Byte, name/role, tutorial battle
│       ├── VillageScene.ts    # the walkable world — all three regions
│       ├── InteriorScene.ts   # reusable enterable-house interior
│       └── BattleScene.ts     # turn-based battle system
├── store/
│   └── gameStore.ts           # zustand store: overlay visibility + live save snapshot
├── ui/
│   ├── OverlayManager.tsx     # listens for window events dispatched by Phaser
│   ├── TrainerCard.tsx        # reads live save data (badges/skills/points/projects found)
│   └── SettingsModal.tsx
├── App.tsx                     # mounts Phaser inside the device bezel
└── main.tsx
```

Phaser and React talk to each other two ways: `window` `CustomEvent`s for
opening overlays (`open-trainer-card`, `open-settings`), and a zustand store
(`useUIStore`) for live game state the UI needs to read, like skill levels.

## Roadmap (Phase 11+)

1. **AttendSmart and FedSecure dungeons** — same portal/puzzle/archive
   pattern as ChronoCLI, once their source is shared.
2. **Genuinely new regions** beyond the current three (Harmony Village,
   Scholar's Route, Vertex City).
3. **ProjectDex** — a persistent, browsable log of every project "found,"
   with architecture notes, challenges, and lessons learned beyond what fits
   in a battle's victory lines.
4. **Ending sequence** — a showcase of your best work, credits roll, and a
   final "Connect" screen with the contact form.
5. **Polish** — music/SFX via Howler.js, code-splitting Phaser out of the
   main bundle, mobile touch controls (a virtual d-pad), and richer sprite
   art.

Say the word and I'll build the next phase the same way this one was built:
incrementally, and always left in a state that runs.

## Notes

- No Pokémon assets, names, or copyrighted material are used anywhere — every
  tile, sprite, portrait, and battle crest is generated in code from hex-color
  palettes.
- No fabricated biography, either. Every NPC line either restates a fact from
  the résumé, or is a clearly-fictional game character (Professor Byte, Kavi,
  the exam proctors, the gym leaders) reacting to universal, non-personal
  situations — never an invented quote or memory attributed to Ritik.
- The production bundle currently includes Phaser in the main chunk (~439 KB
  gzipped). That's normal for a Phaser game; a future polish pass will
  code-split it behind the "Begin Adventure" action so the Trainer Card /
  Speedrun path stays lightweight for recruiters who never touch the canvas.
