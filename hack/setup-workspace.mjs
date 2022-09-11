#!/usr/bin/env node

/**
 * This script initializes this workspace. It will download dependencies and various development utilities.
 */

import { exec } from 'node:child_process';


await new Promise((res, rej) => {
  const yarn = exec('yarn', (err) => {
    if (err) rej(err);
    else res();
  });
  yarn.stdout.on('data', it => console.log(it));
  yarn.stderr.on('data', it => console.error(it));
});

await import('zx/globals');

const tempDir = await (async () => { 
  const { stdout } = await $`mktemp -d`;
  return stdout.trim();
})();

try {
  //
  // Install ngrok
  // https://ngrok.com/
  //
  await $`curl -sSfl https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz > ${ tempDir }/ngrok.tgz`;
  await $`tar -xzf ${ tempDir }/ngrok.tgz --directory ${ tempDir }`;
  await $`sudo mv ${ tempDir }/ngrok /usr/bin/ngrok`;

  //
  // Install httpie
  // https://httpie.io/
  //
  await $`curl -sSfl https://packages.httpie.io/binaries/linux/http-latest > ${ tempDir }/http`
  await $`chmod 744 ${ tempDir }/http`
  await $`sudo mv ${ tempDir }/http /usr/bin/http`

} finally {
  await $`rm -rf ${ tempDir }`;
}
