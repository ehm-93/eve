#!/usr/bin/env node

/**
 * This script will refresh your downloaded static data export (SDE) if it has not been modified since the last refresh.
 * 
 * The SDE will be stored in the data directory within this workspace:
 * ```
 * eve                         # the workspace root
 *  |- data                    # the data directory
 *  |   |- .sde-etag           # an etag for the latest SDE
 *  |   |- sde                 # symlink to the latest SDE
 *  |   |- sde-20220101120343  # a directory containing an SDE, the digits are the refresh timestamp
 *  |   |   |- sde             # An SDE
 * ```
 */

import 'zx/globals';

import path from 'node:path';
import proc from 'node:process';

import { dataDir } from './common.mjs';


const startWhen = new Date();

const thisSdeDir = path.join(
  dataDir, 
  `sde-${ 
    startWhen.getFullYear() 
  }${
    // 0-based index months and 1-based index everything else ( ͡↑ ͜ʖ ͡↑) 
    (startWhen.getMonth() + 1).toString().padStart(2, '0') 
  }${
    startWhen.getDate().toString().padStart(2, '0')
  }${
    startWhen.getHours().toString().padStart(2, '0')
  }${
    startWhen.getMinutes().toString().padStart(2, '0')
  }${
    startWhen.getSeconds().toString().padStart(2, '0')
  }`
);
const sdeDir = path.join(dataDir, 'sde');
const etagFile = path.join(dataDir, '.sde-etag');
const etagFileExists = await fs.pathExists(etagFile);
const etagFileStat = etagFileExists && await fs.lstat(etagFile);


if (!await fs.pathExists(dataDir)) {
  await fs.mkdir(dataDir);
}


let etag;
if (etagFileExists && etagFileStat.isFile()) {
  etag = await fs.readFile(etagFile);
} else if (etagFileExists && !etagFileStat.isFile()) {
  console.error(`The file at "${ etagFile }" is a directory but should not be. Please resolve manually and re-run.`)
  proc.exit(1);
}


const headers = {};
if (etag) headers['if-none-match'] = etag.toString();

const sdeResponse = await fetch('https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip', { headers });

if (400 <= sdeResponse.status) {
  console.error(`Failed to download SDE from url ${ sdeResponse.url } due to error: ${ sdeResponse.status } - ${ sdeResponse.statusText }.`);
  proc.exit(1);
}

if (304 === sdeResponse.status) {
  console.error('The SDE has not been modified since the last refresh. Delete "data/.sde-etag" and re-run to force a refresh.')
  proc.exit(0);
}


const tempDir = await (async () => { 
  const { stdout } = await $`mktemp -d`;
  return stdout.trim();
})();
const sdeZip = path.join(tempDir, 'sde.zip');

await $`touch ${ sdeZip }`;

fs.createWriteStream(sdeZip)
await new Promise(async (resolve, reject) => {
  const fileStream = await fs.createWriteStream(sdeZip);
  sdeResponse.body.pipe(fileStream);
  sdeResponse.body.on('error', reject);
  fileStream.on('finish', resolve);
});

if (await fs.pathExists(thisSdeDir)) {
  console.error(`The directory "${ thisSdeDir }" already exists. Please resolve manually and re-run.`);
  proc.exit(1);
}

await $`unzip "${ sdeZip }" -d "${ thisSdeDir }"`;
await $`rm -rf "${ tempDir }"`;


if (await fs.pathExists(sdeDir)) {
  await $`rm ${ sdeDir }`;
}
await $`ln -s ${ path.join(thisSdeDir, 'sde') } ${ sdeDir }`;

if (etagFileExists) {
  await $`rm "${ etagFile }"`;
}

const newEtag = sdeResponse.headers.get('etag');
if (newEtag) {
  await fs.writeFile(etagFile, newEtag);
}
