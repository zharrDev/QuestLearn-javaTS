# QuestLearn Typing - Asset Brief

This is the commissioning sheet for the remaining art and audio. Existing
placeholder assets are included in the build; new work should replace them
without changing gameplay code.

## Delivery rules

- Deliver PNG with alpha for sprites and UI, 24-bit RGB for backgrounds.
- No AI upscaling, no anti-aliasing, no baked drop shadows, no watermark.
- Use a consistent 1x pixel grid. State the intended display size in the file
  name or delivery note.
- Keep source files (Aseprite/PSD) and a flat PNG export for every animation.
- Name files exactly as listed below; the game loads paths directly.
- Include a licence/attribution note for every delivered file.
- Target delivery before the final QA week: one art pass, one revision pass.

## 1. Hero animation set

**Canvas:** 96x96 px, transparent, feet aligned to bottom-centre, character
facing right.

| Animation | Frames | FPS | Loop | Notes |
| --- | --- | --- | --- | --- |
| idle | 4 | 7 | yes | subtle breathing, cloak movement |
| run | 7 | 14 | yes | readable silhouette, no motion blur |
| jump | 2 | 6 | no | take-off and airborne |
| slash | 7 | 22 | no | sword arc reads at 38 px crate scale |

Keep the character inside roughly 70x88 px of the 96x96 canvas so the runtime
outline and 0.8 scale do not clip. The current placeholder frames are
`idle_01..04`, `run_01..07`, `jump_01..02`, `sword_slash_attack_01..07`.

## 2. World backgrounds

**Canvas:** 960x360 px minimum; 1280x720 px preferred for future-proofing.
**Composition:** leave the left 220 px calm for the HUD, keep the horizon around
y=150-190, and keep the bottom 60 px dark enough for crates and the hero.

| World | File | Direction |
| --- | --- | --- |
| English | `bg-english-village.png` | warm village lanes, cottages, hedges, morning light |
| Indonesian | `bg-indonesia-terraces.png` | rice terraces, palms, golden hour, distant volcano |
| Spanish | `bg-spain-mesas.png` | sunset mesas, dry ruins, cacti, warm dust |
| French | `bg-france-lavender.png` | lavender rows, dusk, quiet woods, cool violet |
| German | `bg-germany-alpine.png` | alpine pines, snow caps, cold blue light |
| Portuguese | `bg-portugal-coast.png` | azulejo rooftops, Atlantic coast, sea spray |

Each background must work with a 30 px horizontal parallax offset. Do not put
critical detail at the extreme edges.

## 3. Crates

**Canvas:** 48x48 px recommended (displayed at 36x36); transparent.
**Style:** chunky wood/stone, top and side bevels, no lettering.

| File | World | Material |
| --- | --- | --- |
| `crate-wood.png` | English, Indonesian, French | mossy dark wood |
| `crate-sandstone.png` | Spanish | carved sandstone |
| `crate-alpine.png` | German | dark pine and iron bands |
| `crate-azulejo.png` | Portuguese | blue tile and pale stone |

Optional cracked variants are welcome, but the base crate must remain readable
with a 20 px letter overlaid.

## 4. UI and marketing

- App icon: 512x512 PNG, same pixel language as the title card.
- Store capsule: 1920x1080 PNG; include the title, hero, and one crate.
- Title logo: transparent PNG, wordmark "QUESTLEARN TYPING", 640 px wide max.
- Optional UI icons, 16x16 or 32x32: heart, clock, target, pause, sound, trophy,
  lock.

## 5. Audio

**Music:** six loops, 60-90 s, seamless loop, stereo WAV 44.1 kHz/16-bit or OGG.
One per world, same melodic motif with different instrumentation. Keep the mix
below the SFX bus; target -16 LUFS.

**SFX:** short mono WAV or OGG, peak below -3 dBFS.

| Cue | Length | Direction |
| --- | --- | --- |
| slash | 80-150 ms | crisp sword swipe, slight pitch variation |
| crate break | 120-250 ms | wood/stone crack, short tail |
| word clear | 250-450 ms | bright ascending chime |
| wrong key | 100-180 ms | muted block, no harsh high frequency |
| heart lost | 300-500 ms | low impact, short |
| countdown tick | 60-120 ms | soft tick |
| countdown go | 250-400 ms | confident rising hit |
| run complete | 0.8-1.5 s | short victory phrase |
| UI click | 40-80 ms | dry pixel click |
| UI hover | 30-60 ms | very quiet tick |

Reserve the `Music` and `SFX` buses already created by `Profile.apply_settings`.
Do not normalise every cue to the same loudness; gameplay cues need contrast.

## 6. Acceptance checklist

- Hero silhouette reads at 77 px display height on both sky and forest.
- No frame clips outside the 96x96 canvas or changes foot position.
- Crate label remains readable at 36x36.
- Backgrounds do not hide crates, target text, or the HUD.
- All assets load in Godot 4.3 with nearest-neighbour filtering.
- Every file has a known licence and is listed in `ASSET_LICENSES.md`.
