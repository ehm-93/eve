const fs = require('node:fs/promises');

const { BlueprintApi, TypeApi } = require('@emmettsdomain/eve-sde-client');


const types = new TypeApi({ path: '/workspace/eve/data/sde/fsd/typeIDs.yaml' })
const blueprints = new BlueprintApi({ path: '/workspace/eve/data/sde/fsd/blueprints.yaml' });

async function main() {
  const [ erebus ] = await types.findByName('en', 'Erebus');

  const tree = {
    typeId: erebus.id,
    name: erebus.name.en,
    quantity: 1,
    basePrice: erebus.basePrice,
    materials: await recipeTree(erebus.id),
  };

  await fs.writeFile('erebus.json', JSON.stringify(tree, null, 2));
}

async function recipeTree(typeId) {
  let [ bp ] = await blueprints.findByActivity(typeId, 'manufacturing', 'product');
  if (!bp) [ bp ] = await blueprints.findByActivity(typeId, 'reaction', 'product');
  if (!(bp?.activities.manufacturing?.materials || bp?.activities.reaction?.materials)) return []

  const result = [];
  const materials = bp.activities.manufacturing?.materials || bp.activities.reaction?.materials;
  for (const mat of materials) {
    const type = await types.findById(mat.typeID);
    result.push({
      typeId: type.id,
      name: type.name.en,
      quantity: mat.quantity,
      basePrice: type.basePrice,
      materials: await recipeTree(type.id),
    });
  }
  return result;
}

main().catch(e => console.error(e));
