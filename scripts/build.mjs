import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await cp(resolve(root, 'index.html'), resolve(out, 'index.html'));
await cp(resolve(root, 'style.css'), resolve(out, 'style.css'));
await cp(resolve(root, 'src'), resolve(out, 'src'), { recursive: true });
await cp(resolve(root, 'public'), resolve(out, 'public'), { recursive: true });

console.log('ShadowNex Prime static build ready in dist/');
