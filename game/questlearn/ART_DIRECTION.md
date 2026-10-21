# QuestLearn Typing - Art Direction

## North star

A warm, readable pixel diorama that feels like a storybook arcade cabinet. The
player should understand the next action in under a second: the active letter
glows, the target word is always visible, and every world has a distinct sense
of place without becoming noisy.

The game renders at **640x360** and scales with integer nearest-neighbour
filtering. Design for that canvas first; the 1280x720 window is only a 2x view.

## Visual pillars

1. **Readable first.** Gameplay text never sits directly on a busy background.
   HUD panels, the target ribbon, and crate labels all have dark backing plates.
2. **Hand-made, not flat.** Backgrounds, crates, and the hero are pixel art.
   Terrain, cliffs, particles, and UI frames are procedural Godot drawing with
   deliberately chunky, snapped shapes.
3. **Six places, one language.** Worlds share a UI language but not a palette.
   Each world changes the background tint, crate skin, accent, terrain colours,
   particle type, and word bank.
4. **Reward the keystroke.** A correct key must produce a visible slash, a crate
   break, a score pop, and a small hero motion. Feedback is immediate and
   layered, not a single sound effect.

## Canvas and safe areas

| Area | Rule |
| --- | --- |
| Internal resolution | 640x360, integer scaling only |
| Outer margin | 10-12 px |
| HUD left panel | 12,10 to 204,134 (192x124) |
| Timer panel | centred, 126x68 |
| Target ribbon | 420x58, anchored to bottom centre |
| Hero home | x=148, feet on y=300 |
| Playfield | crates between x=300 and x=610; avoid HUD collision |
| Result / menus | centred panel, maximum 532x324 |

Text is drawn with snapped pixel positions. Avoid fractional font sizes,
subpixel positioning, drop shadows, gradients, and blur.

## Palette

The UI palette lives in `scripts/ui_kit.gd`.

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#F5EFDF` | Primary text |
| Muted | `#8E9BA8` | Secondary text |
| Panel | `#101A24` | Default card |
| Panel deep | `#0A1119` | Input, track, backing |
| Border | `#46545F` | Panel outlines |
| Accent | `#F2C14E` | Current letter, score, focus |
| Green light | `#8BE3AE` | Success, primary actions |
| Red | `#F2645A` | Damage, errors, destructive actions |
| Blue | `#79C8F2` | Accuracy, progress, colourblind success |

Each world adds an accent and terrain ramp. Do not introduce a new global UI
colour without adding it to `UiKit` first.

## World matrix

| World | Background | Mood | Ambient | Accent |
| --- | --- | --- | --- | --- |
| English | `village-960x360.png` + `bg-english-village.png` | Green village morning | Leaves | Amber |
| Indonesian | `bg-english-village.png` | Rice terraces, golden hour | Fireflies | Amber |
| Spanish | `desert-ruins-960x360.png` | Sunset mesas and ruins | Sand | Terracotta |
| French | `bg-logic-forest.png` | Lavender dusk | Petals | Lilac |
| German | `forest-runes-960x360.png` | Alpine pine cold | Snow | Gold |
| Portuguese | `bg-math-desert.png` | Coastal tiles and sea breeze | Spray | Teal |

The three old backgrounds are reused across six worlds with tinting and
procedural foreground treatment. Commission six unique backgrounds next; see
`ASSET_BRIEF.md`.

## Hero specification

- Source frames are 42-77 px wide/tall and inconsistent. The runtime normalises
  every frame onto a **96x96 bottom-centre canvas** before display.
- Display scale is `0.8`, so the hero occupies roughly 77 px of the 360 px
  canvas.
- Frames: 4 idle, 7 run, 2 jump, 7 sword slash. Animations run at 7, 14, 6, and
  22 fps respectively.
- A one-pixel dark outline shader is applied at runtime. Do not bake outlines
  into new frames unless the outline is consistent on all sides.
- New commissions should be delivered on a 96x96 canvas, feet aligned to the
  bottom-centre, transparent background, no baked shadow.
- Hero should stay readable against both bright skies and dark forests. Prefer a
  strong silhouette and a warm cloak accent over fine interior detail.

## Crates and terrain

- Gameplay cell: **38x38 px**, 5 px gap.
- Crate art is scaled to 36x36 inside the cell; the letter is drawn on top.
- Active crate: warm glow and yellow letter. Completed crate: immediate break
  particles. Wrong key: red flash and block pose.
- Cliff platforms are drawn as masonry courses with a grass cap, cracks, moss,
  side rocks, and a dark base. They must read as solid ground, never floating
  islands.
- Ground line is y=300. Crates must rest on the platform top with no visible
  gap, even while the camera or screen shake moves.

## UI language

- Display font: Press Start 2P. Use only for titles, timer, rank, and short
  labels.
- Body font: VT323 at 13-20 px equivalent. Use for descriptions, buttons, HUD
  labels, and target text.
- Panels are flat, squared, two-pixel outlined. No rounded corners.
- Buttons: dark raised normal state, light border on hover, accent border on
  pressed, muted text when disabled.
- Primary buttons use the green fill with dark text. Destructive actions use the
  dark red fill.
- Motion: 0.18-0.25 s fades and small pops. Screen shake is reserved for damage
  and heavy impacts. Respect the reduced-motion setting.

## FX and audio

- Slash: a crescent arc plus 10-18 pixel shards, 0.2-0.3 s.
- Word clear: score float, crate shards, combo milestone text at 10+.
- Damage: red flash, HUD heart loss, short shake, low error tone.
- Ambient particles are sparse and slow. They must never obscure target text.
- SFX are synthesized at runtime. Music is not implemented yet; reserve the
  `Music` bus and keep loops under 90 s with a clean loop point.

## Don'ts

- No anti-aliased vector art, soft gradients, blur, or rounded UI.
- No text directly over a background without a panel or dark backing.
- No more than three accent colours competing in one frame.
- No art that implies a different hitbox than the 38 px crate cell.
- No new asset that cannot be explained by the world matrix above.
