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
    copying?: Activity;
    invention?: Activity;
    manufacturing?: Activity;
    research_materials?: Activity;
    research_time?: Activity;
    reaction?: Activity;
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
      {
        blueprintTypeID: el => el.blueprintTypeID,
        copying_material: el => el.activities.copying?.materials?.map(it => it.typeID),
        copying_product: el => el.activities.copying?.products?.map(it => it.typeID),
        invention_material: el => el.activities.invention?.materials?.map(it => it.typeID),
        invention_product: el => el.activities.invention?.products?.map(it => it.typeID),
        manufacturing_material: el => el.activities.manufacturing?.materials?.map(it => it.typeID),
        manufacturing_product: el =>  el.activities.manufacturing?.products?.map(it => it.typeID),
        research_materials_material: el => el.activities.research_materials?.materials?.map(it => it.typeID),
        research_materials_product: el => el.activities.research_materials?.products?.map(it => it.typeID),
        research_time_material: el => el.activities.research_time?.materials?.map(it => it.typeID),
        research_time_product: el => el.activities.research_time?.products?.map(it => it.typeID),
        reaction_material: el => el.activities.reaction?.materials?.map(it => it.typeID),
        reaction_product: el => el.activities.reaction?.products?.map(it => it.typeID),
      },
    );
  }

  async findById(id: number): Promise<Blueprint> {
    await this.checkInit();

    const tmp = this.dataset.get(id);
    return { id: tmp.index, ...tmp.value };
  }

  async findByBlueprintTypeId(typeId: number): Promise<Blueprint> {
    await this.checkInit();

    const tmp = await this.dataset.index('blueprintTypeID').findOne(typeId);
    return { id: tmp.index, ...tmp.value };
  }

  async findByActivity(
    typeId: number,
    activity: 'copying' | 'invention' | 'manufacturing' | 'research_materials' | 'research_time' | 'reaction',
    io: 'product' | 'material',
  ): Promise<Blueprint[]> {
    await this.checkInit();

    return (await this.dataset.index(`${ activity }_${ io }`).find(typeId))
      .map(tmp => ({ id: tmp.index, ...tmp.value }));
  }

  private checkInit(): Promise<void> {
    if (!this.init) {
      this.init = this.dataset.init();
    }
    return this.init;
  }
}
