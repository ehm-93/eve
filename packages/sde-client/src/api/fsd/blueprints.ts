import { Dataset } from '../../dataset';
import { FileLoader } from '../../loader';

export interface MaterialQuantity {
  quantity: number;
  typeID: number;
}

export interface SkillLevel {
  level: number;
  typeID: number;
}

export interface Activity {
  materials?: MaterialQuantity[],
  products?: MaterialQuantity[];
  skills?: SkillLevel[],
  time: number;
}

export interface Blueprint {
  id: number;
  activities: {
    copying: Activity;
    invention?: Activity;
    manufacturing: Activity;
    research_materials: Activity;
    research_time: Activity;
  },
  blueprintTypeID: number;
  maxProductionLimit: number;
}

export interface BlueprintApiOptions {
  path: string;
}

export class BlueprintApi {
  private readonly dataset: Dataset<Omit<Blueprint, 'id'>>;
  private init: Promise<void>;

  constructor(
    options: BlueprintApiOptions,
  ) {
    this.dataset = new Dataset(
      new FileLoader(options.path),
      [
        '/blueprintTypeID',
      ],
    );
  }

  async findById(id: number): Promise<Blueprint> {
    await this.checkInit();

    const tmp = this.dataset.get(id);
    return { id: tmp.index, ...tmp.value };
  }

  async findByBlueprintTypeId(typeId: number): Promise<Blueprint> {
    await this.checkInit();

    const tmp = await this.dataset.index('/blueprintTypeID').findOne(typeId);
    return { id: tmp.index, ...tmp.value };
  }

  private checkInit(): Promise<void> {
    if (!this.init) {
      this.init = this.dataset.init();
    }
    return this.init;
  }
}
