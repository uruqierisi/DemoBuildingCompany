import { readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const VIRTUAL_ID = 'virtual:public-assets';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** Folders inside /public whose contents are listed. */
const WATCHED_DIRS = ['renders', 'brand'];

function listFiles(root: string, dir: string): string[] {
  const absolute = path.join(root, dir);
  let entries: string[];
  try {
    entries = readdirSync(absolute);
  } catch {
    return [];
  }
  return entries
    .filter((entry) => !entry.startsWith('.'))
    .flatMap((entry) => {
      const relative = `${dir}/${entry}`;
      return statSync(path.join(root, relative)).isDirectory() ? listFiles(root, relative) : [`/${relative}`];
    });
}

/**
 * Exposes `virtual:public-assets`: the set of files present in /public/renders and /public/brand.
 * Components check it before rendering an <img>, so a missing file shows a labelled placeholder
 * instead of a broken image and a 404 in the console. In dev, adding, replacing or removing a file
 * reloads the page.
 *
 * Also keeps source material out of the build output: the untouched render originals
 * (public/renders/<project>/original/, ~90 MB, input of scripts/optimize-renders.mjs), the brand
 * files as downloaded (public/brand/original/) and .gitkeep placeholders. None is served to visitors.
 */
/** Folders and files copied from /public that must not ship. */
function devOnlyOutputDirs(outDir: string): string[] {
  const rendersOut = path.join(outDir, 'renders');
  let projects: string[] = [];
  try {
    projects = readdirSync(rendersOut);
  } catch {
    projects = [];
  }
  return [
    ...projects.map((project) => path.join(rendersOut, project, 'original')),
    path.join(outDir, 'brand', 'original'),
    ...WATCHED_DIRS.map((dir) => path.join(outDir, dir, '.gitkeep')),
  ];
}

export function publicAssets(): Plugin {
  let publicDir = '';
  let outDir = '';

  return {
    name: 'pozhegu:public-assets',
    configResolved(config) {
      publicDir = config.publicDir;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const files = WATCHED_DIRS.flatMap((dir) => listFiles(publicDir, dir)).sort();
      return `export default new Set(${JSON.stringify(files)});`;
    },
    closeBundle() {
      for (const dir of devOnlyOutputDirs(outDir)) rmSync(dir, { recursive: true, force: true });
    },
    configureServer(server) {
      const watchedRoots = WATCHED_DIRS.map((dir) => path.join(publicDir, dir));
      const onChange = (file: string) => {
        if (!watchedRoots.some((root) => file.startsWith(root))) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(watchedRoots);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
      server.watcher.on('change', onChange);
    },
  };
}
