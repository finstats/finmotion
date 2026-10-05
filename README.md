# FinMotion

How [FinUI](https://github.com/finstats/finui) moves. FinUI is the components — still, plain, complete on their own;
FinMotion is an extra you put on top: one stylesheet and one call, and every FinUI component on the page moves. Vanilla ES
modules and plain CSS, no build step and no dependencies, like FinUI.

```html
<link rel="stylesheet" href="finui.css">
<link rel="stylesheet" href="finmotion.css">
<script type="module">
  import { motion } from './finmotion/core/finmotion.js';
  motion();
</script>
```

`finmotion.css` is FinMotion's stylesheets in the order `registry.json` lists them — `core/springs.css`, then each part's
— served as one, the way a server serves FinUI's (finstats builds both itself).

FinUI needs no change for it. Each part of FinMotion finds its component by FinUI's own classes and moves what FinUI
draws — the ones on the page when `motion()` starts and the ones drawn later — and `motion()` answers a function that
stops it all.

## Four springs

Everything moves on one of four springs, each a feeling:

| spring | for |
|---|---|
| **settle** | the default: arrives quickly and rests without a wobble you could name |
| **snap** | what the hand does: toggles, presses, a knob meeting its end |
| **drift** | what lands: a card dealt, a stamp, a bookmark falling into place |
| **glide** | the large and the slow: sheets, pages, a morph across the screen |

Each is physics — a stiffness and a damping, `core/springs.js` — simulated once and compiled to what CSS understands: a
`linear()` curve and the time it takes to rest. `core/springs.css` keeps them as tokens (a test holds the two together), so a
transition, a keyframe and a script move alike:

```css
.thing { transition: transform var(--spring-snap); }
```
```js
import { play } from './finmotion/core/finmotion.js';
play(el, [{ opacity: 0 }, { opacity: 1 }], 'drift');
```

## It follows FinUI, and the person

- **FinUI's Motion choice is the pace.** A FinUI preset says Quick, Slow or Off through `--ease`; `motion()` reads it, and
  every spring's time is multiplied by it (`--fm-pace`): quicker, slower, or still.
- **Reduced motion stills everything**, above whatever a page or a script set.
- Nothing moves by itself: a part moves when something happens to its component.

## Where things are

```
core/       the springs (springs.js, springs.css), moving from script (motion.js) and motion() (finmotion.js)
parts/      one folder per FinUI component FinMotion moves; index.js lists them
```

## Contract

- Every colour is one of FinUI's tokens; FinMotion names none of its own.
- It styles FinUI's classes (`fui-`) and its own (`fm-`), nothing else.
- It imports nothing from outside itself — not even FinUI: it moves what is on the page.
- FinMotion's checks and tests are kept privately, not in this repository.

GPL-3.0-only, as FinUI and finstats.
