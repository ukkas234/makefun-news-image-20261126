// news-image-20261126 entrypoint (Node 22, standard library only).
// The image is drawn by render.mjs (it builds a self-contained SVG) and
// rasterised by rasterize.mjs (headless Chromium, 1024x1024). This program
// copies the finished PNG to the grader's output directory, so the entry is
// deterministic: the same bytes on every run. No network access.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const src = join(dirname(fileURLToPath(import.meta.url)), 'dist', 'news-image-20261126.png');
copyFileSync(src, join(outDir, 'entry.png'));
