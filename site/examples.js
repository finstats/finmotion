// What the site shows of each part: the FinUI component it moves, drawn as a page would draw it, what to do to it, and
// what a page writes to have it. FinUI draws everything here; FinMotion, on the page, moves it — nothing here moves
// anything itself. Invented data only.

import { h } from '../finui/core.js';
import { num } from '../finui/format.js';
import { button } from '../finui/components/button/button.js';
import { card } from '../finui/components/card/card.js';
import { facts } from '../finui/components/facts/facts.js';
import { toggle } from '../finui/components/toggle/toggle.js';
import { settingRow } from '../finui/components/setting-row/setting-row.js';
import { tabs } from '../finui/components/tabs/tabs.js';
import { formField } from '../finui/components/field/field.js';
import { copyButton } from '../finui/components/copy/copy.js';
import { codeLine } from '../finui/components/code-block/code-block.js';
import { statTile } from '../finui/components/stat-tile/stat-tile.js';
import { barChart } from '../finui/components/bar-chart/bar-chart.js';
import { lineChart } from '../finui/components/line-chart/line-chart.js';
import { sparkline } from '../finui/components/sparkline/sparkline.js';
import { donutChart } from '../finui/components/donut-chart/donut-chart.js';
import { heatmap } from '../finui/components/heatmap/heatmap.js';
import { progressBar } from '../finui/components/progress/progress.js';
import { toast } from '../finui/components/toast/toast.js';
import { openDrawer } from '../finui/components/drawer/drawer.js';
import { openModal } from '../finui/components/modal/modal.js';
import { dataTable } from '../finui/components/data-table/data-table.js';
import { poster } from '../finui/components/poster/poster.js';
import { pageHeader } from '../finui/components/page-header/page-header.js';
import { rankList } from '../finui/components/rank-list/rank-list.js';
import { odometer } from '../finmotion/components/odometer/odometer.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const FILMS = ['Big Buck Bunny', 'Sintel', 'Tears of Steel', 'Cosmos Laundromat', 'Elephants Dream', 'Spring', 'Agent 327', 'Caminandes'];
const said = (text) => h('p', { class: 'muted' }, text);
const marked = (el, cls) => { el.classList.add(cls); return el; };
const wide = (el) => marked(el, 'site-wide');
const narrow = (el) => marked(el, 'site-narrow');

/** A picture for a poster to develop, painted from FinUI's own chart colours as the page has them, and handed over as a
 *  fresh address each time — one the browser has seen arrives already developed. */
function picture(done) {
  const probe = h('span', { hidden: true });
  document.body.append(probe);
  const colour = (t) => { probe.style.color = `var(${t})`; return getComputedStyle(probe).color; };
  const [a, b, c] = ['--series-1', '--series-2', '--series-3'].map(colour);
  probe.remove();
  const canvas = h('canvas', { width: 300, height: 450 });
  const g = canvas.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 450);
  sky.addColorStop(0, a); sky.addColorStop(1, b);
  g.fillStyle = sky; g.fillRect(0, 0, 300, 450);
  g.fillStyle = c; g.beginPath(); g.arc(200, 150, 58, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.5; g.fillStyle = a; g.fillRect(0, 330, 300, 120);
  canvas.toBlob((blob) => done(URL.createObjectURL(blob)));
}

/** Each part, and FinMotion's own component, as the site shows it. `when`: 'hand' moves at once, for what a person did;
 *  'seen' the first time it is in view; 'opt' only where the page adds `cls`. */
export const EXAMPLES = [
  {
    key: 'toggle', group: 'Controls', title: 'A switch with weight', springs: ['snap'], when: 'hand',
    line: 'Pressed, FinUI’s knob is thrown across and stretches on the way, landing at rest at the other end.',
    try: 'Flip a switch.',
    code: "toggle({ checked: true, onChange, labelledby: 'public-label' })   // nothing to add: motion() finds every .fui-toggle",
    render: () => narrow(h('div', { class: 'fui-setting-row__rows' }, ['Public profiles', 'Count short plays', 'Tell me about new titles'].flatMap((label, i) =>
      settingRow({ id: `ex-toggle-${i}`, label, control: toggle({ checked: i !== 1, labelledby: `ex-toggle-${i}-label`, onChange: () => {} }) })))),
  },
  {
    key: 'tabs', group: 'Controls', title: 'An underline that inches', springs: ['snap', 'settle'], when: 'hand',
    line: 'One line under the row instead of an edge under each tab, moving like an inchworm: the edge it goes towards leads, the other follows.',
    try: 'Choose another tab, with the pointer or the arrow keys.',
    code: "tabs({ label: 'Big Buck Bunny', tabs: [{ key: 'overview', label: 'Overview', panel }, …] })",
    render: () => wide(tabs({ label: 'Big Buck Bunny', tabs: [
      { key: 'overview', label: 'Overview', panel: said('A giant rabbit, three bullies and a quiet afternoon in the meadow.') },
      { key: 'plays', label: 'Plays', count: 128, panel: said('Played 128 times by five people, most of them on a Sunday evening.') },
      { key: 'files', label: 'Files', count: 2, panel: said('1080p HEVC, 4.1 GB; and 4K, 11 GB.') },
      { key: 'people', label: 'Everyone who watched it', panel: said('alice, bob, carol, dave and erin.') },
    ] })),
  },
  {
    key: 'field', group: 'Controls', title: 'A gentle no', springs: ['settle'], when: 'hand',
    line: 'When FinUI gives a field a new error, the input shakes its head the way a person does, and the error arrives under it a moment later.',
    try: 'Send it empty, or with something that is not an address.',
    code: "const email = formField({ id: 'email', label: 'E-mail' });\nemail.setError('That is not an address.');   // the no is FinMotion’s",
    render: () => {
      const f = formField({ id: 'ex-email', label: 'E-mail', type: 'email', placeholder: 'you@example.org', help: 'Where the invitation goes.' });
      const send = (e) => {
        e.preventDefault();
        const v = f.input.value.trim();
        const no = !v ? 'Write an address to send it to.' : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? '' : 'That is not an address: it needs an @ and a domain.';
        f.setError(no);
        if (!no) toast({ text: `An invitation is on its way to ${v}.`, tone: 'good' });
      };
      return narrow(h('form', { class: 'site-stack', noValidate: true, onSubmit: send }, f.el, h('div', null, button({ variant: 'primary', type: 'submit' }, 'Send the invitation'))));
    },
  },
  {
    key: 'copy', group: 'Controls', title: 'A tick in one stroke', springs: ['settle', 'glide'], when: 'hand',
    line: 'When FinUI’s copy button has copied, its tick is drawn in one stroke rather than swapped in, and a ring spreads from where it was pressed.',
    try: 'Copy the line, or the address.',
    code: "codeLine('git clone https://github.com/finstats/finmotion')   // or copyButton(text, label)",
    render: () => narrow(h('div', { class: 'site-stack' },
      codeLine('git clone https://github.com/finstats/finmotion', { label: 'Copy the line' }),
      h('div', { class: 'site-row' }, h('span', { class: 'mono' }, 'https://finstats.github.io/finmotion/'), copyButton('https://finstats.github.io/finmotion/', 'Copy the address')))),
  },
  {
    key: 'stat-tile', group: 'Numbers and charts', title: 'Numbers roll', springs: ['drift', 'snap'], when: 'opt', cls: 'fm-roll',
    line: 'A tile whose figure changes rolls it like a film counter, so you see by how much it moved and not only to what. One marked fm-roll rolls up from zero the first time it is seen.',
    try: 'Show another week: each figure rolls from the one it showed.',
    code: "const tile = statTile({ label: 'Plays', value: '1,284' });\ntile.classList.add('fm-roll');   // rolls up from zero when first seen; a new figure always rolls",
    render: () => {
      const weeks = [['42h 10m', '1,284', '5', '318'], ['47h 05m', '1,377', '6', '326'], ['39h 52m', '1,191', '6', '331']];
      let at = 0;
      const tiles = (roll) => weeks[at].map((v, i) => { const t = statTile({ label: ['Watch time', 'Plays', 'People', 'Titles'][i], value: v, hint: 'This week' }); return roll ? marked(t, 'fm-roll') : t; });
      const grid = h('div', { class: 'fui-stat-tile__grid' }, tiles(true));
      return wide(h('div', { class: 'site-stack' }, grid, h('div', null, button({ onClick: () => { at = (at + 1) % weeks.length; grid.replaceChildren(...tiles(false)); } }, 'Another week'))));
    },
  },
  {
    key: 'bar-chart', group: 'Numbers and charts', title: 'Columns rise', springs: ['drift'], when: 'seen',
    line: 'The first time a bar chart is seen, its columns rise from the axis one after another and overshoot a hair before resting.',
    try: 'Draw it again.',
    code: "barChart({ title: 'Plays by weekday', categories, series: [{ name: 'Films', values }] })",
    render: () => wide(barChart({ title: 'Plays by weekday', sub: 'An invented week', categories: DAYS,
      series: [{ name: 'Films', values: [12, 9, 14, 11, 22, 31, 27] }, { name: 'Episodes', values: [18, 21, 17, 24, 19, 26, 30] }] })),
  },
  {
    key: 'line-chart', group: 'Numbers and charts', title: 'A line drawn as a pen would', springs: ['glide', 'drift'], when: 'seen',
    line: 'The first time a line chart is seen, each line is drawn left to right, the wash under it follows, and the last value lands as its dot.',
    try: 'Draw it again.',
    code: "lineChart({ title: 'Plays', labels: months, series: [{ name: 'Plays', values }] })",
    render: () => wide(lineChart({ title: 'Plays', sub: 'Each month of the last year', labels: MONTHS,
      series: [{ name: 'Films', values: MONTHS.map((_, i) => Math.round(60 + 30 * Math.sin((i + 1) / 2) + i * 6)) }, { name: 'Episodes', values: MONTHS.map((_, i) => Math.round(80 + 40 * Math.sin((i + 3) / 2) + i * 9)) }] })),
  },
  {
    key: 'sparkline', group: 'Numbers and charts', title: 'A small line, drawn in', springs: ['settle', 'drift'], when: 'seen',
    line: 'The first time a sparkline is seen it is drawn in, and the last value lands as its dot.',
    try: 'Draw them again.',
    code: "statTile({ label: 'Plays', value: '34', spark: sparkline({ values, label: 'Plays each week' }) })",
    render: () => wide(h('div', { class: 'fui-stat-tile__grid fui-stat-tile__grid--three' },
      [['Watched this week', '34', [12, 15, 14, 19, 22, 27, 34]], ['Hours this week', '21', [30, 26, 27, 22, 25, 19, 21]], ['New titles', '9', [2, 3, 3, 5, 4, 7, 9]]].map(([label, value, values]) =>
        statTile({ label, value, hint: 'Each week for seven weeks', spark: sparkline({ values, label: `${label}, each week: ${values.join(', ')}` }) })))),
  },
  {
    key: 'donut-chart', group: 'Numbers and charts', title: 'A donut, poured', springs: ['glide'], when: 'seen',
    line: 'The first time a donut is seen it is poured round from the top, one share after another, the largest first and longest.',
    try: 'Pour it again.',
    code: "donutChart({ title: 'How it plays', parts: [{ name: 'Direct play', value: 62 }, …] })",
    render: () => narrow(donutChart({ title: 'How it plays', sub: 'An invented month', total: { value: '1,284', label: 'plays' },
      parts: [{ name: 'Direct play', value: 62 }, { name: 'Direct stream', value: 23 }, { name: 'Transcode', value: 15 }] })),
  },
  {
    key: 'heatmap', group: 'Numbers and charts', title: 'A ripple', springs: ['settle'], when: 'hand',
    line: 'A cell pressed answers like water: the cells around it light and settle in rings, the nearest first.',
    try: 'Press a cell.',
    code: "heatmap({ title: 'When people watch', rows: days, cols: hours, values })",
    render: () => wide(heatmap({ title: 'When people watch', sub: 'Plays by hour and weekday', rows: DAYS, cols: HOURS,
      values: DAYS.map((_, d) => HOURS.map((__, hh) => { const evening = hh >= 18 && hh <= 23 ? 6 : hh >= 12 ? 2 : hh < 2 ? 3 : 0; return Math.max(0, evening + ((d * 5 + hh * 3) % 4) - (d < 5 && hh < 17 ? 2 : 0)); })) })),
  },
  {
    key: 'progress', group: 'Numbers and charts', title: 'Progress on film', springs: ['settle'], when: 'opt', cls: 'fm-film',
    line: 'A progress bar marked fm-film runs on film: its track becomes a strip whose frames slide under the gate as the share grows — for something played, not something copied.',
    try: 'Play on, ten minutes at a time.',
    code: "const bar = progressBar({ label: 'Big Buck Bunny', value: 0.2 });\nbar.classList.add('fm-film');   // its strip follows aria-valuenow",
    render: () => {
      let at = 0.2;
      const bar = marked(progressBar({ label: 'Big Buck Bunny', value: at, detail: 'On the living room TV' }), 'fm-film');
      // What a player does as it plays: the share FinUI drew, moved on.
      const on = () => {
        at = at >= 0.95 ? 0 : Math.min(1, at + 0.1);
        const p = Math.round(at * 100);
        bar.querySelector('.fui-progress__track').setAttribute('aria-valuenow', String(p));
        bar.querySelector('.fui-progress__fill').style.width = `${p}%`;
        bar.querySelector('.fui-progress__share').textContent = `${p}%`;
      };
      return narrow(h('div', { class: 'site-stack' }, bar, h('div', null, button({ onClick: on }, 'Ten minutes on'))));
    },
  },
  {
    key: 'toast', group: 'Overlays', title: 'Notices held like cards', springs: ['settle', 'snap'], when: 'hand',
    line: 'FinUI’s notices are held like a hand of cards: piled, the newest in front and the older ones peeking out behind it; pointed at, the hand fans open so each can be read. One dismissed drops away while the pile closes up.',
    try: 'Send a few, then point at the pile in the corner.',
    code: "toast({ text: 'Saved.', tone: 'good' })",
    render: () => {
      const notes = [['The library was read again: 12 new titles.', 'good'], ['Sintel was added to Films.', 'info'], ['The server took long to answer.', 'warning'], ['alice started watching Spring.', 'info'], ['The backup could not be written.', 'critical']];
      let n = 0;
      return h('div', { class: 'site-row' }, button({ variant: 'primary', onClick: () => { const [text, tone] = notes[n++ % notes.length]; toast({ text, tone }); } }, 'Send a notice'));
    },
  },
  {
    key: 'drawer', group: 'Overlays', title: 'A sheet that gives', springs: ['glide', 'drift'], when: 'hand',
    line: 'A drawer slides in on glide. A bottom sheet is held by its head: down it follows the finger and, let go a third of the way or flicked, it goes; up it gives like a band.',
    try: 'Open the sheet, then drag it by its head.',
    code: "openDrawer({ title: 'Big Buck Bunny', side: 'bottom', body })",
    render: () => {
      const about = () => facts([['Resolution', '1080p HEVC'], ['Size', '4.1 GB', { mono: true }], ['Audio', 'English · Japanese'], ['Added', '3 days ago'], ['Played', '128 times']]);
      return h('div', { class: 'site-row' },
        button({ variant: 'primary', onClick: () => openDrawer({ title: 'Big Buck Bunny', side: 'bottom', body: about() }) }, 'A sheet from the bottom'),
        button({ onClick: () => openDrawer({ title: 'Big Buck Bunny', side: 'right', body: about() }) }, 'A drawer from the right'));
    },
  },
  {
    key: 'modal', group: 'Overlays', title: 'A dialog arrives', springs: ['settle'], when: 'hand',
    line: 'A dialog rises a little and comes up to size as the page behind it dims. Styles only: there is nothing to listen to.',
    try: 'Open it.',
    code: "openModal({ title: 'Remove Sintel?', body })",
    render: () => h('div', { class: 'site-row' }, button({ variant: 'primary', onClick: () => {
      const m = openModal({ title: 'Remove Sintel from the library?', body: [said('Its plays stay in the history; the file stays on the disk.'),
        h('div', { class: 'site-row' }, button({ variant: 'primary', tone: 'critical', onClick: () => m.close() }, 'Remove it'), button({ variant: 'ghost', onClick: () => m.close() }, 'Keep it'))] });
    } }, 'Open a dialog')),
  },
  {
    key: 'data-table', group: 'Pages', title: 'Rows that make room', springs: ['settle', 'drift'], when: 'opt', cls: 'fm-arrive',
    line: 'When a FinUI table is sorted, its rows move from where they were to where the sort put them. A table marked fm-arrive deals its rows in, one after another, the first time it is seen.',
    try: 'Sort it by any column, twice.',
    code: "dataTable(table, { cls: 'fm-arrive' })   // the sort moves every table; fm-arrive deals this one in",
    render: () => {
      const rows = FILMS.map((f, i) => [f, `${(i * 7 + 3) % 11 + 1}h ${(i * 17) % 60}m`, `${((i * 13) % 9 + 1) / 2} GB`, num(((i * 211) % 1300) + 40)]);
      return wide(card({ cls: 'fui-card--flush', body: dataTable(h('table', { class: 'fui-data-table' },
        h('thead', null, h('tr', null, h('th', null, 'Title'), h('th', { class: 'r' }, 'Watch time'), h('th', { class: 'r' }, 'Size'), h('th', { class: 'r' }, 'Plays'))),
        h('tbody', null, rows.map((r) => h('tr', null, h('td', null, r[0]), h('td', { class: 'mono r' }, r[1]), h('td', { class: 'mono r' }, r[2]), h('td', { class: 'mono r' }, r[3]))))), { filter: false, cls: 'fm-arrive' }) }));
    },
  },
  {
    key: 'poster', group: 'Pages', title: 'A poster develops, and catches the light', springs: ['glide', 'snap', 'drift'], when: 'opt', cls: 'fm-develop · fm-light',
    line: 'A poster marked fm-develop develops like a photograph as its picture arrives. One marked fm-light tips towards the pointer, and a sheen crosses it where the light would fall — for one large poster, not a grid of them.',
    try: 'Point at the poster on the right; draw them again to see the left one develop.',
    code: "const art = poster(src, 'Sintel', { cls: 'fui-poster--lg' });\nart.classList.add('fm-develop');   // or fm-light",
    render: () => {
      const slot = h('span');
      picture((src) => slot.replaceWith(marked(poster(src, 'Big Buck Bunny', { cls: 'fui-poster--lg' }), 'fm-develop')));
      return h('div', { class: 'site-row' }, slot, marked(poster(null, 'Sintel', { cls: 'fui-poster--lg' }), 'fm-light'));
    },
  },
  {
    key: 'page-header', group: 'Pages', title: 'A header that gathers', springs: [], when: 'opt', cls: 'fm-gathers',
    line: 'A page header marked fm-gathers stays at the top of what scrolls and, tied to the scroll and never on a timer, gathers itself in: the title shrinks into a bar, the line under it folds away.',
    try: 'Scroll the page in the box.',
    code: "const head = pageHeader('Living room', 'An invented week');\nhead.classList.add('fm-gathers');",
    render: () => {
      const head = marked(pageHeader('Living room', 'An invented week on an invented server', button({ size: 'sm' }, 'Share')), 'fm-gathers');
      return wide(card({ cls: 'fui-card--flush', body: h('div', { class: 'site-scroller' }, h('div', { class: 'site-stack' }, head,
        h('div', { class: 'fui-stat-tile__grid' }, [['Watch time', '42h'], ['Plays', '128'], ['People', '5'], ['Titles', '318']].map(([label, value]) => statTile({ label: `${label} (the room)`, value, hint: 'This week' }))),
        card({ title: 'Most watched', body: rankList(FILMS.map((f, i) => ({ href: '#', thumb: poster(null, f, { cls: 'fui-poster--sm' }), name: f, sub: `${2006 + i}`, value: `${14 - i}h`, note: `${num(31 - i * 3)} plays` }))) }))) }));
    },
  },
  {
    key: 'odometer', group: 'FinMotion’s own', title: 'Odometer', springs: ['drift', 'snap'], when: 'own',
    line: 'FinMotion’s one component: a number that rolls its digits like a film counter, the rightmost quickest and each on its own spring. The stat tile rolls with it; a page can use it anywhere a number changes.',
    try: 'Add to it, take from it, or pick another.',
    code: "import { odometer } from './finmotion/components/odometer/odometer.js';\nconst plays = odometer({ value: '1,284', from: '0' });\nplays.set('1,421');",
    render: () => {
      let n = 1284;
      const reel = odometer({ value: num(n), from: '0' });
      const to = (v) => { n = Math.max(0, v); reel.set(num(n)); };
      return narrow(h('div', { class: 'site-stack' }, statTile({ label: 'Plays', value: reel, hint: 'Drawn by FinUI’s stat tile, rolled by the odometer' }),
        h('div', { class: 'site-row' }, button({ onClick: () => to(n + 1) }, '+1'), button({ onClick: () => to(n + 137) }, '+137'), button({ onClick: () => to(n - 50) }, '−50'),
          button({ variant: 'ghost', onClick: () => to(Math.round(Math.random() * 99999)) }, 'Another number'))));
    },
  },
];
