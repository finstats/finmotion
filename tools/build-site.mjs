// The site the pages workflow publishes: FinMotion shown on FinUI. It is made of FinUI, so it is built from a FinUI
// checkout (beside FinMotion, or FINUI_DIR; the workflow checks one out) as well as from FinMotion:
//
//   index.html     the site (site/index.html), and site/ its script and the layout of what FinUI draws
//   finui/         FinUI's files as its registry lists them, the fonts its base.css names, and its presets
//   finmotion/     FinMotion as it ships, and finmotion.css: its stylesheets joined in registry.json's order
//   install.sh     the installer (tools/install.sh), with the list of FinMotion's files filled in
//
// node tools/build-site.mjs <folder>
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

/** FinMotion's stylesheets as one, in registry.json's order: the springs first, then each part's, then each component's. */
export function finmotionCss(registry, read) {
  const files = [...registry.foundation, ...registry.parts.flatMap((p) => p.files), ...(registry.components || []).flatMap((c) => c.files)];
  return files.filter((f) => f.endsWith('.css')).map((f) => `/* ${f} */\n${read(f).trimEnd()}\n`).join('\n');
}

export async function build(out, { finui = process.env.FINUI_DIR || path.join(root, '../finui') } = {}) {
  finui = path.resolve(finui);
  if (!fs.existsSync(path.join(finui, 'registry.json'))) throw new Error(`no FinUI checkout at ${finui} (put it beside FinMotion, or set FINUI_DIR)`);
  const read = (f, from = root) => fs.readFileSync(path.join(from, f), 'utf8');
  const copy = (f, from, to) => { fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true }); fs.cpSync(path.join(from, f), path.join(out, to), { recursive: true }); };
  const write = (f, text) => { fs.mkdirSync(path.dirname(path.join(out, f)), { recursive: true }); fs.writeFileSync(path.join(out, f), text); };

  const registry = JSON.parse(read('registry.json'));
  const shipped = [...registry.foundation, ...registry.parts.flatMap((p) => p.files), ...(registry.components || []).flatMap((c) => c.files)];
  const ui = JSON.parse(read('registry.json', finui));
  const library = [...ui.foundation, ...ui.components.flatMap((c) => c.files), 'registry.json', 'create/presets.json', 'LICENSE'];
  const fonts = [...new Set([...read('base.css', finui).matchAll(/fonts\/([A-Za-z0-9._-]+)/g)].map((m) => m[1]))];

  fs.mkdirSync(out, { recursive: true });
  copy('site/index.html', root, 'index.html');
  for (const f of fs.readdirSync(path.join(root, 'site'))) if (f !== 'index.html') copy(`site/${f}`, root, `site/${f}`);
  for (const f of [...shipped, 'registry.json', 'LICENSE']) copy(f, root, `finmotion/${f}`);
  write('finmotion/finmotion.css', finmotionCss(registry, (f) => read(f)));
  for (const f of library) copy(f, finui, `finui/${f}`);
  for (const f of fonts) copy(`fonts/${f}`, finui, `finui/fonts/${f}`);
  write('install.sh', read('tools/install.sh').replace('@FILES@', [...shipped, 'registry.json', 'LICENSE', 'finmotion.css'].join(' ')));
}

function fail(m) { console.error(m); process.exit(1); }
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const out = process.argv[2] || fail('node tools/build-site.mjs <folder>');
  await build(path.resolve(out)).catch((e) => fail(e.message));
  console.log(`✓ the site is in ${out}`);
}
