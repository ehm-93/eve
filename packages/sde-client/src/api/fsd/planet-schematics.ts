import { Dataset } from '../../dataset';
import { FileLoader } from '../../loader';
import { I18n } from '../../types';

export interface PlanetSchematicMaterial {
  isInput: boolean;
  quantity: number;
}

export interface PlanetSchematic {
  cycleTime: number;
  nameID: I18n,
  pins: number[],
  types: { [ key: number ]: PlanetSchematicMaterial },
}

export interface PlanetSchematicApiOptions {
  path: string;
}

export class PlanetSchematicApi {
  private readonly dataset: Dataset<PlanetSchematic>;
  private init: Promise<void>;

  constructor(
    options: PlanetSchematicApiOptions,
  ) {
    this.dataset = new Dataset<PlanetSchematic>(
      new FileLoader(options.path),
      {
        input: el => Object.entries(el.types)
          .filter(([ , it ]) => it.isInput)
          .map(([ id ]) => id),
        output: el => Object.entries(el.types)
          .filter(([ , it ]) => !it.isInput)
          .map(([ id ]) => id),
      }
    );
  }

  async findByOutput(typeId: number): Promise<PlanetSchematic[]> {
    await this.checkInit();

    return (await this.dataset.index('output').find(typeId)).map(it => it.value);
  }

  async findByInput(typeId: number): Promise<PlanetSchematic[]> {
    await this.checkInit();

    return (await this.dataset.index('input').find(typeId)).map(it => it.value);
  }

  private checkInit(): Promise<void> {
    if (!this.init) {
      this.init = this.dataset.init();
    }
    return this.init;
  }
}
