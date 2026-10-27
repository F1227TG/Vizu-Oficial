const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/vizu.css'), 'utf8');
const missing = [];
for (const [source, base, regex] of [
  [html, root, /(?:src|href)="([^"#]+)"/g],
  [css, path.join(root, 'css'), /url\(['"]?([^'"\)]+)['"]?\)/g],
]) {
  for (const [, ref] of source.matchAll(regex)) {
    if (/^(https?:|data:|mailto:)/.test(ref)) continue;
    const target = path.resolve(base, ref.split(/[?#]/)[0]);
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) missing.push(ref);
  }
}
if (missing.length) throw new Error(`Missing or external local dependencies: ${missing.join(', ')}`);
console.log('All local resources are present inside the Vizu repository.');
