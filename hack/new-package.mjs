#!/usr/bin/env node

/**
 * This script generates a new sub-package with a default configuration.
 */

import 'zx/globals';

import path from 'node:path';
import url from 'node:url';
import { exit } from 'node:process';


const hackDir = url.fileURLToPath(new URL('.', import.meta.url));
const workspaceDir = path.join(hackDir, '..');

const tsconfig = {
  extends: '../../tsconfig.base.json',
  compilerOptions: {
      outDir: 'dist',
      rootDir: 'src',
  },
};

const name = await question('Package name: ');

const packageDir = path.join(hackDir, '..', 'packages', name);

if (await fs.pathExists(packageDir)) {
  console.error(`The package "${ name }" already exists.`)
  exit(1)
}

const packageJson = {
  name: `@emmettsdomain/eve-${ name }`,
  main: 'dist',
  devDependencies: {
    '@types/node': '18',
  },
};


await $`mkdir ${ packageDir }`;
await $`mkdir ${ path.join(packageDir, 'src') }`;
await fs.writeFile(path.join(packageDir, 'src', 'index.ts'), `console.log('Hello, @emmettsdomain/eve-${ name }!');\n`)
await fs.writeJSON(path.join(packageDir, 'package.json'), packageJson, { spaces: 2 });
await fs.writeJSON(path.join(packageDir, 'tsconfig.json'), tsconfig, { spaces: 2 });


const rootTsconfig = await fs.readJSON(path.join(workspaceDir, 'tsconfig.json'));

if (!rootTsconfig.references) rootTsconfig.references = [];

rootTsconfig.references.push({ path: `packages/${ name }` });
await fs.writeJSON(path.join(workspaceDir, 'tsconfig.json'), rootTsconfig, { spaces: 2 });


await $`yarn`
