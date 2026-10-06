# FinMotion

How [FinUI](https://github.com/finstats/finui) moves. FinUI is the components — still, plain, complete on their own;
FinMotion is an extra you put on top: one stylesheet and one call, and every FinUI component on the page moves. Vanilla ES
modules and plain CSS, no build step and no dependencies, like FinUI.

**[See every part move, and try FinUI's Motion choice on it →](https://finstats.github.io/finmotion/)**

## Install

FinMotion is source you copy and own, like FinUI. One command copies it into `./finmotion` — its files and
`finmotion.css`, every stylesheet joined in order — with nothing but `curl` and `sh`. It writes only into an empty folder
(`--dir` names another) and fetches everything before it writes anything.

```sh
curl -fsSL https://finstats.github.io/finmotion/install.sh | sh
```

### Alongside FinUI

This is what FinMotion is for. Install FinUI with its own installer (its [create page](https://finstats.github.io/finui/create/)
gives you one with your look in it), then FinMotion beside it, from the same folder:

```sh
curl -fsSL https://finstats.github.io/finui/install.sh | sh        # FinUI into ./finui
curl -fsSL https://finstats.github.io/finmotion/install.sh | sh    # FinMotion into ./finmotion, beside it
```

Load FinMotion's stylesheet after all of FinUI's, and call `motion()` once:

```html
<!-- FinUI's stylesheets first: tokens.css, base.css and each component's, in finui/registry.json's order (or one finui.css) -->
<link rel="stylesheet" href="finui/tokens.css">
<link rel="stylesheet" href="finui/base.css">
<!-- … -->
<link rel="stylesheet" href="finmotion/finmotion.css">
<script type="module">
  import { motion } from './finmotion/core/finmotion.js';
  motion();
</script>
```

From then on every FinUI component on the page moves — the ones there now and the ones drawn later — and `motion()`
answers a function that stops it all. FinUI needs no change for it: each part finds its component by FinUI's own classes
and moves what FinUI draws. What a person does to a component moves at once; an entrance or a flourish waits for the `fm-`
class a page adds (`fm-roll` on a stat tile, `fm-arrive` on a table, `fm-film` on a progress bar, …) — the
[site](https://finstats.github.io/finmotion/) has a page for each, with the class it needs.

### On its own

Without FinUI there is nothing for the parts to move, so leave `motion()` out — but the springs and the script are yours on
any page: `finmotion.css` gives every element the four springs as tokens, `core/finmotion.js` moves anything on them, and
the odometer is a component of FinMotion's own.

```sh
curl -fsSL https://finstats.github.io/finmotion/install.sh | sh
```

```html
<link rel="stylesheet" href="finmotion/finmotion.css">
<style>
  .menu { transition: translate var(--spring-snap), opacity var(--spring-settle); }
</style>
<script type="module">
  import { play, deal, flip } from './finmotion/core/finmotion.js';
  import { odometer } from './finmotion/components/odometer/odometer.js';

  play(document.querySelector('.card'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 'drift');
  deal(document.querySelectorAll('li'));                        // a list dealt in, one after another
  const plays = odometer({ value: '1,284', from: '0' });         // rolls up the first time it is seen
  document.querySelector('.count').append(plays);
  plays.set('1,421');                                            // and rolls again when it changes
</script>
```

On its own the pace is FinMotion's own, 1 — there is no FinUI Motion choice to follow — and reduced motion still stills
everything.

### By hand

Clone the repository and copy `core/`, `parts/`, `components/`, `registry.json` and `LICENSE` into your project. Load
`core/springs.css` and then each CSS file `registry.json` lists, in its order, or join them into one `finmotion.css`
(`node tools/build-site.mjs <folder>` writes one into `<folder>/finmotion/`). `site/`, `tools/` and `.github/` are the
site, and not part of FinMotion.

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
components/ FinMotion's own (the odometer)
site/       the site, which is not part of FinMotion: it is built, never copied into a page
tools/      build-site.mjs, which builds it, and install.sh, the installer it serves
```

## The site

[The site](https://finstats.github.io/finmotion/) is made of FinUI, as FinUI's own is, and wears FinMotion as any page
does: a page for each part, with the component to press, sort, drag or scroll; the four springs, run and drawn; FinUI's
Motion choice to change the pace; and a switch that takes FinMotion off, so FinUI is seen as it ships. The pages workflow
builds it on every push to `main` with a FinUI checkout beside FinMotion; to see it here, with FinUI in `../finui`:

```sh
node tools/build-site.mjs /tmp/finmotion-site && python3 -m http.server -d /tmp/finmotion-site 8767
```

## Contract

- Every colour is one of FinUI's tokens; FinMotion names none of its own.
- It styles FinUI's classes (`fui-`) and its own (`fm-`), nothing else.
- It imports nothing from outside itself — not even FinUI: it moves what is on the page.
- FinMotion's checks and tests are kept privately, not in this repository.

GPL-3.0-only, as FinUI and finstats.
