# QuestLearn Typing - Asset Licence Ledger

This ledger covers files shipped in `game/questlearn/art`. It is a working
record, not a legal opinion. Do not submit a public commercial store page until
the "Pending" entries are resolved.

## Fonts

| File | Source | Licence | Status |
| --- | --- | --- | --- |
| `art/fonts/VT323-Regular.ttf` | VT323 Project Authors | SIL Open Font License 1.1 | Cleared; `art/fonts/OFL-VT323.txt` included |
| `art/PressStart2P-Regular.ttf` | Press Start 2P by CodeMan38 | SIL Open Font License 1.1 | Cleared; `art/OFL-PressStart2P.txt` included |

The VT323 licence file is the authoritative copy for that font. Press Start 2P
is generally distributed under the SIL OFL; confirm the exact upstream notice
before publishing.

## Art used by the game

All files below were copied from `frontend/public/assets`. Their original
provenance has not been recorded in this repository.

| Files | Use | Status |
| --- | --- | --- |
| `village-960x360.png` | English/Indonesian backdrop | Pending source confirmation |
| `desert-ruins-960x360.png` | Spanish backdrop | Pending source confirmation |
| `forest-runes-960x360.png` | German backdrop | Pending source confirmation |
| `bg-english-village.png` | Indonesian/French/Portuguese backdrop | Pending source confirmation |
| `bg-logic-forest.png` | French backdrop | Pending source confirmation |
| `bg-math-desert.png` | Portuguese backdrop | Pending source confirmation |
| `mossy-crate-32-removebg-preview.png` | Crate skin | Pending source confirmation; filename suggests background removal was applied |
| `sandstone-block-32-removebg-preview.png` | Crate skin / old cliff source | Pending source confirmation |
| `idle_01..04.png` | Hero idle | Pending source confirmation |
| `run_01..07.png` | Hero run | Pending source confirmation |
| `jump_01..02.png` | Hero jump | Pending source confirmation |
| `sword_slash_attack_01..07.png` | Hero slash | Pending source confirmation |

If the original packs cannot be traced, replace these with commissioned art
before a commercial release. For the university demo/expo build, retain this
ledger and credit the asset sources in the presentation.

## Generated and procedural work

The following are original project work and carry the project's licence:

- `scripts/ui_kit.gd`: panels, buttons, scanlines, vignette, slider grabber.
- `scripts/arena.gd`: procedural cliffs, ground, grass, ambient particles,
  hero outline shader, target framing.
- `scripts/arena_fx.gd`: slash arcs, hit particles, floating text.
- `scripts/sfx.gd`: runtime-synthesised sound effects.
- `screenshots/*.png` and `art/icon.svg` / `art/icon.png`: project documentation
  and branding assets.

## Credits text

Use this in the demo build and presentation:

```
QuestLearn Typing
Game and UI: QuestLearn team
Engine: Godot 4.3
Body font: VT323 (SIL OFL 1.1)
Display font: Press Start 2P (SIL OFL 1.1)
Placeholder art: original QuestLearn asset pack (source pending)
```

## Release checklist

- [x] Add `OFL-PressStart2P.txt` with the upstream copyright line.
- [ ] Add a `CREDITS.txt` next to the exported executable.
- [ ] Replace or document every "Pending" art file.
- [ ] Confirm the commissioned artist's contract allows the intended public
      distribution (expo, portfolio, and store build separately).
- [ ] Add audio licences here when commissioned music/SFX arrive.
