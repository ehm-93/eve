/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import * as proc from 'node:process';


import { SdeApi } from '@emmettsdomain/eve-sde-client';
import { RecipeService } from '@emmettsdomain/eve-services';

async function main(params: string[]): Promise<void> {
  if (params.length !== 3) {
    console.error(`Usage: ${ params[1] } <target type>`);
    proc.exit(1);
  }

  const base = '/workspace/eve/data/sde';

  const sde = new SdeApi({ path: base });
  const recipes = new RecipeService(sde);

  const [ type ] = await sde.fsd.typeIDs.findByName('en', params[2]);
  if (!type) {
    console.error(`No ${ params[2] } :^(`);
    proc.exit(1);
  }

  const tree = await recipes.tree(type);

  proc.stdout.write(JSON.stringify(tree));
}

main(proc.argv).catch(e => console.error(e));
