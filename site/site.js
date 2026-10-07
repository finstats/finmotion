// The FinMotion site: FinMotion shown on FinUI. It is made of FinUI (every part a person sees is one of FinUI's
// components, and site.css only lays them out; a test holds it to that), and it wears FinMotion as any page does: its
// stylesheet after FinUI's and one motion() call. A switch takes FinMotion off, so FinUI is seen as it ships, and FinUI's
// own Motion choice sets the pace. Invented data only.

import { h, icon, mount } from '../finui/core.js';
import { button } from '../finui/components/button/button.js';
import { card } from '../finui/components/card/card.js';
import { callout } from '../finui/components/callout/callout.js';
import { chip } from '../finui/components/chip/chip.js';
import { codeBlock } from '../finui/components/code-block/code-block.js';
import { emptyState } from '../finui/components/empty/empty.js';
import { facts } from '../finui/components/facts/facts.js';
import { hero } from '../finui/components/hero/hero.js';
import { pageHeader, sectionHeader } from '../finui/components/page-header/page-header.js';
import { sectionNav } from '../finui/components/sections/sections.js';
import { segmented } from '../finui/components/segmented/segmented.js';
import { statTile } from '../finui/components/stat-tile/stat-tile.js';
import { tabs } from '../finui/components/tabs/tabs.js';
import { themeSwitch } from '../finui/components/theme-switch/theme-switch.js';
import { toggle } from '../finui/components/toggle/toggle.js';
import { settingRow } from '../finui/components/setting-row/setting-row.js';
import { topBar } from '../finui/components/top-bar/top-bar.js';
import { lineChart } from '../finui/components/line-chart/line-chart.js';
import { barChart } from '../finui/components/bar-chart/bar-chart.js';
import { donutChart } from '../finui/components/donut-chart/donut-chart.js';
import { motion, pace, play, spring } from '../finmotion/core/finmotion.js';
import { SPRINGS, springOf } from '../finmotion/core/springs.js';
import { EXAMPLES } from './examples.js';

const root = document.getElementById('site');
const sheet = document.getElementById('finmotion-css');
const keep = (key, value) => { try { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* not kept */ } };
const kept = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const nameOf = (key) => key.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const GITHUB = 'https://github.com/finstats/finmotion';

const SNIPPET = `<link rel="stylesheet" href="finui.css">
<link rel="stylesheet" href="finmotion/finmotion.css">
<script type="module">
  import { motion } from './finmotion/core/finmotion.js';
  motion();
</script>
`;
const GET = `curl -fsSL https://finstats.github.io/finui/install.sh | sh        # FinUI into ./finui
curl -fsSL https://finstats.github.io/finmotion/install.sh | sh    # FinMotion into ./finmotion, beside it
`;

// ---- the theme of the page, kept in this browser, as FinUI's site keeps it
function applyTheme(choice) {
  if (choice === 'light' || choice === 'dark') document.documentElement.dataset.theme = choice;
  else delete document.documentElement.dataset.theme;
  keep('finmotion.theme', choice === 'device' ? null : choice);
}

// ---- FinMotion on the page, and the pace FinUI's Motion choice sets
let presets = null, stop = null, route = () => {};
let on = kept('finmotion.on') !== 'off';
let paceKey = kept('finmotion.pace') || 'default';
const paced = new Set();   // what says a spring's time at this pace, told when it changes

const motionAxis = () => presets.axes.find((a) => a.key === 'motion');
/** The Motion choice as a FinUI preset makes it: its tokens on :root, after FinUI's own. FinMotion reads --ease from them. */
function applyPace(key) {
  const option = motionAxis().options.find((o) => o.key === key) || motionAxis().options[0];
  paceKey = option.key;
  keep('finmotion.pace', paceKey === 'default' ? null : paceKey);
  document.querySelector('style[data-motion]').textContent = option.tokens ? `:root {\n${Object.entries(option.tokens).map(([t, v]) => `  ${t}: ${v};\n`).join('')}}\n` : '';
  if (on) pace();
  for (const say of paced) say();
}
/** FinMotion on, as a page wears it, or off: FinUI as it ships. The page is drawn again either way. */
function wear(next) {
  on = next;
  keep('finmotion.on', on ? null : 'off');
  if (stop) { stop(); stop = null; }
  sheet.disabled = !on;
  if (on) stop = motion(document.body);
}

/** What every page carries: FinUI's Motion choice, and FinMotion on or off. */
function controls() {
  const id = 'site-wearing';
  const pick = segmented({ label: 'FinUI’s Motion choice', size: 'sm', value: paceKey, options: motionAxis().options.map((o) => ({ value: o.key, label: o.label })), onChange: applyPace });
  const wearing = toggle({ checked: on, labelledby: id, onChange: (v) => { wear(v); route(); const t = document.querySelector('.site-controls .fui-toggle'); if (t) t.focus(); } });
  return h('div', { class: 'site-controls' },
    h('span', { class: 'site-row' }, h('span', { class: 'muted' }, 'Motion'), pick),
    h('span', { class: 'site-row' }, wearing, h('span', { id }, 'FinMotion')));
}
/** Said once at the top of every page while the device asks for stillness: nothing moving is FinMotion working. */
const stillness = () => (reduce.matches ? callout({ tone: 'info', title: 'Your device asks for reduced motion', body: 'FinMotion stills everything for it, above anything a page or a script sets, so nothing on this site moves for you. That is FinMotion working.' }) : null);
const offNote = () => (on ? null : callout({ tone: 'info', title: 'FinMotion is off', body: 'This is FinUI as it ships: still, plain and complete. Switch FinMotion on to see it move.' }));

// ---- a spring: its curve, its numbers, and something running on it
function springCard(name, { curve = false } = {}) {
  const spec = SPRINGS[name], { samples, ms } = springOf(spec);
  const runner = chip(name);
  runner.classList.add('site-runner');
  const track = h('div', { class: 'site-track' }, runner);
  let out = false;
  const run = () => {
    const w = Math.max(0, track.clientWidth - runner.offsetWidth);
    runner.getAnimations().forEach((a) => a.cancel());
    out = !out;
    play(runner, [{ transform: `translateX(${out ? 0 : w}px)` }, { transform: `translateX(${out ? w : 0}px)` }], name);
  };
  const now = h('span');
  const say = () => { now.textContent = !on ? 'still: FinMotion is off' : `${spring(name).duration} ms`; };
  say(); paced.add(say);
  const points = 24;
  const chart = curve ? lineChart({ title: null, labels: Array.from({ length: points + 1 }, (_, i) => `${Math.round((i / points) * ms)} ms`),
    series: [{ name: 'Where it is', values: Array.from({ length: points + 1 }, (_, i) => +samples[Math.round((i / points) * (samples.length - 1))].toFixed(3)) }],
    format: (v) => `${Math.round(v * 100)}%`, height: 160 }) : null;
  return card({ title: nameOf(name), sub: spec.line, actions: button({ size: 'sm', onClick: run }, icon('play', 13), 'Run'),
    body: [track, chart, facts([['Stiffness', String(spec.stiffness), { mono: true }], ['Damping', String(spec.damping), { mono: true }], ['At rest after', `${ms} ms`, { mono: true }], ['At this pace', now, { mono: true }]])] });
}

// ---- the landing
function living() {
  const body = h('div');
  const draw = () => mount(body, h('div', { class: 'site-stack' },
    h('div', { class: 'fui-stat-tile__grid fui-stat-tile__grid--three' }, [['Watch time', '42h 10m'], ['Plays', '1,284'], ['People', '5']].map(([label, value]) => {
      const t = statTile({ label, value, hint: 'This week' }); t.classList.add('fm-roll'); return t;
    })),
    tabs({ label: 'This week', tabs: [
      { key: 'month', label: 'Each month', panel: () => lineChart({ labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], series: [{ name: 'Plays', values: [820, 940, 870, 1130, 1284] }], height: 150 }) },
      { key: 'days', label: 'Each day', panel: () => barChart({ categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], series: [{ name: 'Plays', values: [120, 96, 141, 118, 220, 310, 279] }], height: 150 }) },
      { key: 'how', label: 'How it plays', panel: () => donutChart({ parts: [{ name: 'Direct play', value: 62 }, { name: 'Direct stream', value: 23 }, { name: 'Transcode', value: 15 }], size: 140 }) },
    ] }),
    h('div', { class: 'fui-setting-row__rows' }, settingRow({ id: 'site-live-public', label: 'Public profiles', control: toggle({ checked: true, labelledby: 'site-live-public-label', onChange: () => {} }) }))));
  draw();
  return card({ title: 'Living room', sub: 'FinUI’s components, and FinMotion on them', actions: button({ size: 'sm', variant: 'ghost', onClick: draw }, icon('refresh', 13), 'Again'), body });
}

const GROUPS = [...new Set(EXAMPLES.map((x) => x.group))];
const WHEN = { hand: 'At once, when a person does something to it', seen: 'The first time it is seen', opt: 'Where the page marks it', own: 'When its number changes' };
function partIndex() {
  return GROUPS.map((g) => h('section', { class: 'site-group' }, sectionHeader(g),
    h('div', { class: 'site-grid' }, EXAMPLES.filter((x) => x.group === g).map((x) => card({ href: `#/part/${x.key}`, title: nameOf(x.key), sub: x.title })))));
}

function landing(slot) {
  const top = hero({
    title: 'How FinUI moves.',
    lede: 'FinUI’s components are still, plain and complete on their own. FinMotion is one stylesheet and one call on top of them, and every FinUI component on the page moves: on four springs, at the pace FinUI’s Motion choice sets, and not at all for a device that asks for stillness.',
    actions: [button({ href: '#/parts', variant: 'primary' }, 'See every part'), button({ href: '#/springs' }, 'The four springs')],
    aside: h('div', { class: 'site-hero-aside' }, living()),
    children: [controls(), codeBlock({ label: 'Put it on a page', panes: [{ key: 'html', label: 'On a page', text: SNIPPET }, { key: 'sh', label: 'Get it', text: GET }] })],
  });
  top.classList.add('site-hero');
  mount(slot, h('div', { class: 'site-page' }, stillness(), offNote(), top,
    h('section', { class: 'site-group' }, sectionHeader('Four springs', 'Everything moves on one of them, each a feeling: physics simulated once and compiled to what CSS understands.', button({ size: 'sm', variant: 'ghost', href: '#/springs' }, 'Their curves', icon('chevronRight', 13))),
      h('div', { class: 'site-springs' }, Object.keys(SPRINGS).map((n) => springCard(n)))),
    h('section', { class: 'site-group' }, sectionHeader('It follows FinUI, and the person'),
      h('div', { class: 'site-grid-2' },
        card({ title: 'FinUI’s Motion choice is the pace', sub: 'Quick is quicker, Slow slower, Off still. Every spring’s time is multiplied by it. Try it above.' }),
        card({ title: 'Reduced motion stills everything', sub: 'Above anything a page or a script set. Nothing moves for a device that asks.' }),
        card({ title: 'What a person did moves at once', sub: 'A press, a sort, a drag. What arrives (rows dealt in, a poster developing) waits for an fm- class the page adds.' }),
        card({ title: 'FinUI needs no change', sub: 'Each part finds its component by FinUI’s own classes and moves what FinUI draws, now and as it is drawn.' }))),
    ...partIndex()));
}

function springsPage(slot) {
  mount(slot, h('div', { class: 'site-page' }, stillness(), offNote(),
    pageHeader('Four springs', 'Each a stiffness and a damping, simulated once and compiled to a linear() curve and the time it takes to rest, so a transition, a keyframe and a script move alike.', controls()),
    h('div', { class: 'site-grid-2' }, Object.keys(SPRINGS).map((n) => springCard(n, { curve: true }))),
    codeBlock({ label: 'On a spring', panes: [
      { key: 'css', label: 'CSS', text: '.thing { transition: transform var(--spring-snap); }\n' },
      { key: 'js', label: 'JavaScript', text: "import { play } from './finmotion/core/finmotion.js';\nplay(el, [{ opacity: 0 }, { opacity: 1 }], 'drift');\n" },
    ] })));
}

function partsPage(slot) {
  mount(slot, h('div', { class: 'site-page' }, stillness(), offNote(),
    pageHeader('Parts', `${EXAMPLES.length - 1} of FinUI’s components move, and FinMotion has one of its own. Each has a page to try it on.`, controls()), ...partIndex()));
}

function partPage(slot, x, parts) {
  const list = EXAMPLES.map((e) => ({ key: `part/${e.key}`, label: nameOf(e.key), icon: 'layers', group: e.group }));
  const stage = h('div', { class: 'site-stage' });
  const draw = () => mount(stage, x.render());
  const part = parts.find((p) => p.name === x.key);
  const about = [
    ['Moves', part ? h('span', null, 'FinUI’s ', h('span', { class: 'mono' }, part.finui)) : 'Itself: it is FinMotion’s own'],
    ['When', WHEN[x.when]],
    x.cls ? ['Mark', h('span', { class: 'mono' }, x.cls)] : null,
    ['Springs', x.springs.length ? x.springs.join(', ') : 'none: it follows the scroll'],
    ['Reduced motion', 'Still'],
  ].filter(Boolean);
  mount(slot, h('div', { class: 'site-bench' },
    h('aside', { class: 'site-side' }, sectionNav('#', list, `part/${x.key}`, 'Parts')),
    h('div', { class: 'site-bench-main' }, stillness(), offNote(),
      pageHeader([x.title, ' ', h('span', { class: 'mono muted' }, x.key)], x.line, controls()),
      card({ title: x.try, actions: button({ size: 'sm', variant: 'ghost', onClick: draw }, icon('refresh', 13), 'Draw it again'), body: stage }),
      h('div', { class: 'site-docs' }, card({ title: 'What moves', body: facts(about.map(([k, v]) => [k, v, { wide: true }])) }),
        codeBlock({ label: 'On a page', panes: [{ key: 'js', label: 'On a page', text: `${x.code}\n` }] })))));
  draw();
}

async function start() {
  const [ui, fm] = await Promise.all(['finui/registry.json', 'finmotion/registry.json'].map(async (f) => (await fetch(f)).json()));
  presets = await (await fetch('finui/create/presets.json')).json();
  // Each FinUI component's stylesheet after its foundation and before FinMotion's, in FinUI's order.
  for (const f of ui.components.flatMap((c) => c.files.filter((x) => x.endsWith('.css')))) sheet.before(h('link', { rel: 'stylesheet', href: `finui/${f}` }));
  applyPace(paceKey);
  wear(on);

  const slot = h('div');
  const bar = topBar({ brand: { name: 'FinMotion', href: '#/' }, label: 'FinMotion',
    links: [{ href: '#/parts', label: 'Parts', key: 'parts' }, { href: '#/springs', label: 'Springs', key: 'springs' }, { href: 'https://finstats.github.io/finui/', label: 'FinUI' }, { href: GITHUB, label: 'GitHub' }],
    actions: themeSwitch({ value: kept('finmotion.theme') || 'device', onChange: applyTheme }) });
  mount(root,
    button({ href: '#main', class: 'site-skip', onClick: (e) => { e.preventDefault(); document.getElementById('main').focus(); } }, 'Skip to the page'),
    bar,
    h('main', { class: 'site-main', id: 'main', tabindex: '-1' }, slot),
    h('footer', { class: 'site-foot muted' }, 'FinMotion is free software under the GNU GPL v3. Everything on this site is drawn by FinUI and moved by FinMotion.'));

  route = () => {
    paced.clear();
    const key = location.hash.replace(/^#\/?/, '');
    const x = key.startsWith('part/') && EXAMPLES.find((e) => e.key === key.slice(5));
    bar.setCurrent(x ? 'parts' : key);
    if (x) { document.title = `${nameOf(x.key)} · FinMotion`; partPage(slot, x, fm.parts); return; }
    if (key === 'springs') { document.title = 'Springs · FinMotion'; springsPage(slot); return; }
    if (key === 'parts') { document.title = 'Parts · FinMotion'; partsPage(slot); return; }
    document.title = 'FinMotion';
    landing(slot);
  };
  window.addEventListener('hashchange', () => { route(); window.scrollTo({ top: 0 }); });
  reduce.addEventListener('change', () => route());
  route();
}

start().catch((e) => mount(root, emptyState('The site could not start', String(e && e.message || e))));
