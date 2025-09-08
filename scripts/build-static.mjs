import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'public');

const entriesToCopy = [
  'index.html',
  'services.html',
  'service-detail.html',
  'roi-calculator.html',
  'css',
  'js',
  'images',
  'config'
];

async function rimraf(target) {
  try {
    await fs.rm(target, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await ensureDir(dest);
    const items = await fs.readdir(src);
    for (const item of items) {
      await copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    await ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
  }
}

async function main() {
  await rimraf(outDir);
  await ensureDir(outDir);
  for (const entry of entriesToCopy) {
    const src = path.join(root, entry);
    try {
      await fs.access(src);
    } catch {
      continue; // skip missing
    }
    const dest = path.join(outDir, entry);
    await copyRecursive(src, dest);
  }
  // Log a simple summary
  console.log(`Built static site to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

