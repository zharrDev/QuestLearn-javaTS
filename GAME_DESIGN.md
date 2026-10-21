# QuestLearn Typing - Game Design (Godot build)

> 2D pixel-art typing arena. Six language worlds, a guest/offline mode, a
> backend-connected account mode, and a complete menu-to-result flow. This
> document describes the shipped Godot 4.3 client in `game/questlearn`.

---

## 1. Core concept

The hero holds the left side of a side-scrolling arena. Words arrive as rows of
letter crates mounted on ground ledges and masonry cliffs. Typing the highlighted
letter slashes that crate; finishing a word destroys the whole group and awards
points. A group that reaches the hero costs one heart.

The game trains real typing speed and accuracy. Spaces and punctuation count.
Diacritics can be typed with or without accents (`pájaro` accepts `pajaro`), so
players on any keyboard layout can compete.

---

## 2. Language worlds

| World | Landscape | Backdrop | Ambient | Content examples |
| --- | --- | --- | --- | --- |
| English | Green village hills | `village-960x360.png` | Leaves | `book`, `good morning`, `The quiet village woke up.` |
| Bahasa Indonesia | Rice terraces | `bg-english-village.png` | Fireflies | `buku`, `terima kasih`, `Jangan pernah menyerah pada mimpimu.` |
| Español | Sunset mesas | `desert-ruins-960x360.png` | Sand | `libro`, `buenos días`, `El pueblo tranquilo despertó.` |
| Français | Lavender dusk | `bg-logic-forest.png` | Petals | `livre`, `bonne nuit`, `Le village tranquille s'est réveillé.` |
| Deutsch | Alpine pines | `forest-runes-960x360.png` | Snow | `Buch`, `guten Morgen`, `Das stille Dorf erwachte.` |
| Português | Coastal tiles | `bg-math-desert.png` | Spray | `livro`, `bom dia`, `A aldeia tranquila acordou.` |

Adding a language is a data change in `scripts/worlds.gd` plus the matching
backend world/word seed. The client keeps a fallback word bank so guest mode
works without the backend.

---

## 3. Core loop

1. Title screen -> continue as guest or sign in.
2. Pick a world, difficulty, and session length (30 s / 1 min / 5 min).
3. Ready screen -> 3-2-1 countdown -> run starts.
4. Crates scroll in from the right. The target group scrolls with the terrain.
5. Type the glowing letter:
   - **Correct** -> slash, crate break, combo +1, hero dash, score +.
   - **Wrong** -> red flash, combo reset; the group keeps approaching.
   - **Word complete** -> finisher animation, clear bonus, floating `+N`.
6. A group that reaches the hero costs one heart and is marked missed.
   Zero hearts or zero time ends the run.
7. Result screen -> local record is always saved; signed-in runs are submitted to
   `POST /api/typing/submit`. Failed submissions are queued locally.

### Lock-on rules

- With no active target, the first typed letter locks the nearest group whose
  next letter matches.
- Once locked, every following key is compared against that word, so a closer
  group cannot steal progress mid-word.
- The lock is released only when the word is completed or its group passes.

---

## 4. Terrain and "no floating crates" rule

- A word group owns a platform in world space. The crates are positioned so
  their bottom edge rests on the platform top.
- Ground groups stand on a grass/dirt ledge.
- Elevated groups stand on masonry cliffs drawn all the way down to the ground
  line, including a wider base.
- Long words wrap into multiple rows on the same platform (up to 8 columns).
- Platform height is capped by the screen; tall words are downgraded to a lower
  tier when needed.
- The platform moves with the camera and screen shake exactly like its crates.

The current cliff treatment is procedural masonry with grass caps, moss, cracks,
side rocks, and a dark base. The earlier sandstone texture is no longer used for
cliffs.

---

## 5. Art and presentation

The build uses a hybrid pipeline:

- **External pixel art:** six backdrops (three unique files reused with tints),
  two crate skins, hero idle/run/jump/slash frames.
- **Runtime normalisation:** hero frames are inconsistent sizes, so every frame
  is fitted onto a 96x96 bottom-centre canvas before display. Adds a one-pixel
  outline shader.
- **Procedural Godot drawing:** cliffs, ground, grass, cracks, ambient particles,
  slash arc, particles, HUD panels, scanlines, vignette, slider tracks.
- **Fonts:** Press Start 2P for display, VT323 for body text.
- **Resolution:** 640x360 internal, nearest-neighbour, integer scaling.

The full visual contract is in `game/questlearn/ART_DIRECTION.md`; the asset
commissioning sheet is `game/questlearn/ASSET_BRIEF.md`.

---

## 6. Difficulty and scoring

| Level | Hearts | Groups on screen | Scroll speed | Max cliff tier | Word pool |
| --- | --- | --- | --- | --- | --- |
| EASY | 5 | 3 | 27 px/s | 1 | 3-5 letters, no punctuation |
| MEDIUM | 4 | 3 | 34 px/s | 2 | 5-8 letters / short phrases |
| HARD | 3 | 4 | 42 px/s | 2 | Full sentences, punctuation |

Difficulty multiplier: EASY x1, MEDIUM x2, HARD x3.

Scoring:

- Correct key: `+2 * multiplier`.
- Word clear: `length * 8 * multiplier + floor(combo / 10) * 5`.
- Combo milestone every 10 hits shows a floating callout.

Metrics:

- **WPM** = `(correct characters / 5) / elapsed minutes` (spaces count).
- **Accuracy** = correct key presses / all printable key presses.
- Correct and total keystrokes are tracked separately from words.

The result rank uses accuracy and WPM:

| Rank | Rule |
| --- | --- |
| S | accuracy >= 98% and WPM >= 35 |
| A | accuracy >= 94% |
| B | accuracy >= 85% |
| C | everything else |

---

## 7. Game feel and accessibility

- Delta-time simulation capped at 50 ms, not assumed 60 fps.
- Camera and spawn pacing use pixel speed and viewport fractions.
- Explicit ready screen, 3-2-1 countdown, pause (`Esc` or HUD button), restart,
  auto-pause on window focus loss.
- Screen shake on damage/heavy clears, with a setting to disable it.
- Reduced-motion mode disables screen shake, ambient motion, and background
  parallax.
- Colourblind palette switches success feedback from green to blue (timer,
  hearts, typed letters).
- Localisation: English and Indonesian UI, persisted immediately. Gameplay
  content is always in the selected world's language.
- Audio settings: master, music, SFX, mute. Bus layout is created at runtime.
- Guest mode is fully playable offline; settings, profile, XP, and run history
  are stored under `user://`.

---

## 8. Technical architecture

```
game/questlearn/
├── main.tscn / scripts/main.gd    # app shell and screen flow
├── scripts/
│   ├── arena.gd                   # gameplay simulation and rendering
│   ├── arena_fx.gd                # particles, floating text, slash arcs
│   ├── hud.gd                     # HUD and overlays
│   ├── api.gd                     # HTTP client and session persistence
│   ├── loc.gd                     # EN/ID copy
│   ├── profile.gd                 # settings, local profile, offline queue
│   ├── worlds.gd                  # six worlds and fallback word banks
│   ├── ui_kit.gd                  # shared theme and UI primitives
│   └── sfx.gd                     # runtime-synthesised SFX
├── tests/
│   ├── smoke.gd                   # backend + arena end-to-end
│   └── ui_smoke.gd                # guest/offline flow
└── art/                           # backgrounds, crates, hero frames, fonts
```

Arena state machine: `ready -> countdown -> playing <-> paused -> over`.
Rendering is separate from simulation; spawn/RNG decisions live in the arena so
the scene can be reproduced from state.

Backend content:

- `DataSeeder` creates the 6 `dunia` rows, chapters, demo users, and badges.
- `TypingWordSeeder` creates 419 `typing_words` across EASY/MEDIUM/HARD.
- `GET /api/typing/start` returns the word bank for the chosen world + level.
- `POST /api/typing/submit` persists WPM/accuracy/combo/kills, XP, streak, and
  badges.

---

## 9. Production checklist

- [x] Six language worlds with native fallback word banks
- [x] Guest/offline mode and backend account mode
- [x] Complete screen flow: title, login, worlds, ready, arena, pause, over,
      result, settings
- [x] Hero frame normalisation, outline shader, slash FX
- [x] Masonry cliffs and grounded crates
- [x] Real WPM/accuracy metrics, difficulty-based scoring
- [x] Pause, restart, countdown, mute
- [x] Local profile, best score, run history, offline submit queue
- [x] Accessibility settings: screen shake, reduced motion, colourblind palette
- [x] Backend smoke test passes (19 checks)
- [x] Guest UI smoke test passes (13 checks)
- [ ] Commissioned backgrounds/hero/audio
- [ ] Music implementation
- [ ] Final asset licence audit

Known demo limitations: music is absent, the backend is development-only
(H2, open CORS, hardcoded JWT secret), and the client is trusted for score/WPM.
