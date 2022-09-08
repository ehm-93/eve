import { SdeApi, Type } from '@emmettsdomain/eve-sde-client';

export interface RecipeTree {
  typeId: number;
  name: string;
  materials?: RecipeTree[];
  outputQuantity?: number;
  inputQuantity?: number;
  kind?: string;
  basePrice?: number;
}

export class RecipeService {
  constructor(
    private readonly sde: SdeApi,
  ) { }

  async tree(type: Type): Promise<RecipeTree> {
    const [ manuf ] = await this.sde.fsd.blueprints.findByActivity(type.id, 'manufacturing', 'product');
    if (manuf) {
      const materials = await Promise.all(
        manuf.activities.manufacturing!.materials!.map(async it => ({
          inputQuantity: it.quantity,
          ...await this.tree(await this.sde.fsd.typeIDs.findById(it.typeID)),
        }))
      );

      return {
        typeId: type.id,
        name: type.name.en,
        basePrice: type.basePrice,
        kind: 'manufacturing',
        outputQuantity: manuf.activities.manufacturing!.products!.find(it =>
          it.typeID === type.id
        )!.quantity,
        materials,
      };
    }

    const [ reaction ] = await this.sde.fsd.blueprints.findByActivity(type.id, 'reaction', 'product');
    if (reaction) {
      const materials = await Promise.all(
        reaction.activities.reaction!.materials!.map(async it =>({
          inputQuantity: it.quantity,
          ...await this.tree(await this.sde.fsd.typeIDs.findById(it.typeID)),
        }))
      );

      return {
        typeId: type.id,
        name: type.name.en,
        basePrice: type.basePrice,
        kind: 'reaction',
        outputQuantity: reaction.activities.reaction!.products!.find(it =>
          it.typeID === type.id
        )!.quantity,
        materials,
      };
    }

    const [ pi ] = await this.sde.fsd.planetSchematics.findByOutput(type.id);
    if (pi) {
      const materials = await Promise.all(
        Object.entries(pi.types)
          .filter(([ , it ]) => it.isInput)
          .map(async ([ id, mat ]) => ({
            inputQuantity: mat.quantity,
            ...await this.tree(await this.sde.fsd.typeIDs.findById(Number(id))),
          }))
      );

      return {
        name: type.name.en,
        typeId: type.id,
        basePrice: type.basePrice,
        kind: 'planetaryInteraction',
        outputQuantity: pi.types[type.id]!.quantity,
        materials,
      };
    }

    return {
      typeId: type.id,
      name: type.name.en,
      basePrice: type.basePrice,
    };
  }
}
