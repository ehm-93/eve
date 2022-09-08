import * as path from 'node:path';

import { BlueprintApi, PlanetSchematicApi, TypeApi } from './fsd';

export interface BsdOptions {
  path: string;
}

export class BsdApi { }

export interface FsdOptions {
  path: string;
}

export class FsdApi {
  readonly blueprints: BlueprintApi;
  readonly planetSchematics: PlanetSchematicApi;
  readonly typeIDs: TypeApi;

  constructor(
    private readonly options: FsdOptions,
  ) {
    this.blueprints = new BlueprintApi({ path: path.join(this.options.path, 'blueprints.yaml') })
    this.planetSchematics = new PlanetSchematicApi({ path: path.join(this.options.path, 'planetSchematics.yaml') })
    this.typeIDs = new TypeApi({ path: path.join(this.options.path, 'typeIDs.yaml') })
  }
}

export interface SdeOptions {
  path: string;
}

export class SdeApi {
  readonly bsd: BsdApi;
  readonly fsd: FsdApi;

  constructor(
    private readonly options: SdeOptions,
  ) {
    this.bsd = new BsdApi();
    this.fsd = new FsdApi({ path: path.join(this.options.path, 'fsd') });
  }
}
