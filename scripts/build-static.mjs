import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const required = ['index.html', 'personal.html', 'app.js', 'styles.css', 'profile.js', 'public'];
for (const name of required) {
  if (!existsSync(join(root, name))) throw new Error(`Missing portfolio file: ${name}`);
}
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const name of [...required, 'version_1.html', 'css', 'images', 'js', 'fonts', 'portfolio.json', 'game', 'Profile.pdf']) {
  if (existsSync(join(root, name))) cpSync(join(root, name), join(output, name), { recursive: true });
}
console.log('Static portfolio packaged in dist/ (with the existing game when available).');
