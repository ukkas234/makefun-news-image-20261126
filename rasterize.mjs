// news-image-20261126 — rasterise dist/news-image-20261126.svg to PNG 1024x1024
// with the local headless Chromium (no network). Deterministic: the same SVG
// always produces the same PNG bytes modulo Chromium's PNG encoder, which is
// stable for identical input; the submitted program copies the PNG, so the
// graded bytes are exactly the bytes committed here.
//
//   node rasterize.mjs --check   # writes dist/news-image-20261126.png
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME_BIN ?? '/home/hatch/workspace/tools/chromium/chrome-linux/chrome';
const svgPath = join(dir, 'dist', 'news-image-20261126.svg');
const pngPath = join(dir, 'dist', 'news-image-20261126.png');
const htmlPath = join(dir, 'dist', 'shot.html');

function pngDims(buf) {
  if (buf.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('not a PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const svg = readFileSync(svgPath, 'utf8');
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#F6F1E5}svg{display:block;width:1024px;height:1024px}</style></head><body>${svg}</body></html>`;
writeFileSync(htmlPath, html);
execFileSync(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--window-size=1024,1024',
  `--screenshot=${pngPath}`, `file://${htmlPath}`,
], { stdio: 'pipe', timeout: 120000 });
const buf = readFileSync(pngPath);
const { w, h } = pngDims(buf);
const problems = [];
if (w !== 1024 || h !== 1024) problems.push(`PNG is ${w}x${h}, want 1024x1024`);
if (buf.length > 1048576) problems.push(`PNG ${buf.length} bytes > 1 MiB`);
if (problems.length) { console.error('RASTERIZE FAILED:\n' + problems.join('\n')); process.exit(1); }
console.log(`RASTERIZE OK — ${w}x${h}, ${buf.length} bytes -> ${pngPath}`);
