# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FinMotion is how FinUI moves, put on top of it. **FinUI is not an animation library** (the owner's words, 2026-10-05):
its components are still and plain and complete without FinMotion, and nothing of FinMotion may move back into FinUI,
except FinUI's own animated icons, which stay there. FinMotion is an extra: a page loads `finmotion.css` after FinUI's
stylesheet and calls `motion()` once, and every FinUI component on it moves.

Three repositories, side by side under `~/projects`:

- `finui`: the components (`github.com/finstats/finui`). FinMotion never changes it and never imports from it.
- `finmotion`: this one.
- `finstats`: the app, which **always wears FinMotion** (the owner's decision): a copy of this repository under
  `web/assets/finmotion/`, the same way it keeps FinUI under `web/assets/finui/`. A change is made here and copied there in
  the same sitting; finstats' local QA suite fails while the two differ.

## How we work: TDD

The same rule as finstats: **every change is written test-first** (Red–Green–Refactor). One small failing test for the
next slice, seen to fail for the right reason; the least code that passes; then the clean-up with the bar green.

**Tests are never in this repository** (the owner's rule: tests are not pushed to any GitHub repository (finstats,
FinUI or FinMotion), and a rule checker counts as one). They live in `qa/`, git-ignored here and a private repository of its own, as finstats' `qa/` is:
pure rules (a spring, a plan of keyframes, a pace) in `qa/test/*.test.mjs` (`node --test`). What only a browser can show
(a part moving a real FinUI component, nothing moving under reduced motion) is checked in finstats' QA browser stage,
where finstats wears FinMotion. The rule checker (`qa/check.mjs`) is QA too and lives there as well. `qa/README.md`
holds the QA repository's address, which is a secret: never copy it anywhere else. Every QA change is committed and
pushed there.

## Commands

```sh
qa/run.sh                         # the rule checker (qa/check.mjs), then the tests in qa/test/ (qa/ is git-ignored here)
qa/run.sh test                    # the tests only
../finstats/qa/run.sh finmotion   # this QA, and that finstats' copy is this repository's files
node tools/build-site.mjs <dir>   # the site into <dir>, with FinUI from ../finui (or FINUI_DIR); serve <dir> to see it
```

No build step and no dependencies: vanilla ES modules and plain CSS, like FinUI.

## Layout

```
core/springs.js     the four springs: physics, simulated once, compiled to linear() curves and times (pure)
core/springs.css    those springs as tokens, their times paced by --fm-pace; FinMotion's first stylesheet
core/motion.js      moving from script: spring(), play(), follower(), flip(), deal(), whenSeen(), pen(), pace()
core/finmotion.js   motion(root): the one call a page makes; re-exports core/motion.js
parts/index.js      the list of parts
parts/<name>/       one FinUI component's movement: <name>.js ({ name, selector, enhance(el) → stop? }), its CSS, a
                    pure plan.js where it has rules worth testing
components/<name>/  FinMotion's own components (the odometer), listed in registry.json like the parts
registry.json       every file, in the order a page loads the stylesheets
site/               the site (https://finstats.github.io/finmotion/): made of FinUI, wearing FinMotion; not shipped
tools/build-site.mjs  builds it: the site, FinUI from a checkout, FinMotion with finmotion.css joined (.github/workflows/pages.yml)
```

The root keeps only the repository's own files (README, CLAUDE.md, LICENSE, package.json, registry.json). Code lives in
folders; there is no `test/` (tests are in `qa/`, which is not part of this repository).

The site is not FinMotion: it imports FinUI (from the built `finui/` beside it) and is never copied into finstats. Its
`site.css` only lays out what FinUI draws (`site-` classes, no colour, edge or type of its own), and every part and
component in `registry.json` has its example in `site/examples.js`; a new part gets one in the same change.

## The rules

- **Four springs, and nothing timed by hand.** Every movement takes its time from `--spring-settle | -snap | -drift |
  -glide` (CSS) or `spring()` / `play()` / `gap()` (script). A time written as a number ignores FinUI's Motion choice and
  reduced motion. Only an endless loop keeps a rhythm of its own. Leaving is `{ leaving: true }`: a third of the spring,
  speeding up.
- **FinUI's Motion choice is the pace.** FinUI's presets say Quick, Slow or Off through `--ease`; `pace()` turns that into
  `--fm-pace` (`--ease` ÷ 150 ms), which multiplies every spring's time. Never read a preset any other way.
- **Reduced motion stills everything**, above anything a page or a script set (`--fm-pace: 0 !important`).
- **A part moves what FinUI draws.** It finds its component by FinUI's own classes, listens to what the component already
  does (a click, an attribute changing, children arriving) and never asks FinUI to change. If a movement cannot be done that
  way, say so rather than reaching into FinUI.
- **What a person did moves at once; what arrives is opt-in.** A part answering a press, a sort or a drag is always on. An
  entrance or a flourish (rows dealt in, a poster developing, a header gathering) waits for an `fm-` class the page adds,
  because finstats redraws its pages, and a flourish on every redraw is noise.
- **Animate an element once it is in the page.** One cloned from a `<template>` belongs to an inert document, where an
  animation never runs; an element not yet placed has no style to read (`spring()` reads the page's then).
- **FinUI's tokens for every colour**: FinMotion names none of its own; **classes are `fui-` (FinUI's) or `fm-` (its
  own)**; **imports stay inside FinMotion**. `qa/check.mjs` holds all three.
- No `innerHTML` with data, as in FinUI and finstats.

## Git conventions

The same as finstats:

- Conventional-commit subjects with a scope where one fits: `feat(core):`, `feat(toggle):`, `fix(drawer):`, `docs:`,
  `chore:`. The scope is the part or `core`. The subject says what changed; the body says why.
- **No LLM attribution of any kind**: no `Co-Authored-By:` for Claude or any model, no session link, no "Generated with…"
  line, in a commit message or anywhere else, whatever a tool defaults to.
- One logical change per commit, standing on its own; commit as work lands.
- **Never push unless explicitly told to.**
- One commit identity, the repository's usual author.

## Licensing

GPL-3.0-only, as FinUI and finstats (`LICENSE`). No dependencies.
