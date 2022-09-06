const { BlueprintApi, TypeApi } = require('@emmettsdomain/eve-sde-client');

async function main() {
  const types = new TypeApi({ path: '/workspace/eve/data/sde/fsd/typeIDs.yaml' })
  const blueprints = new BlueprintApi({ path: '/workspace/eve/data/sde/fsd/blueprints.yaml' });

  const [ type ] = await types.findByName('en', 'Erebus Blueprint');

  console.log(type);

  const bp = await blueprints.findByBlueprintTypeId(type.id);

  console.log(bp);

  const materials = await Promise.all(
    bp.activities.manufacturing.materials
      .map(mat => 
        types.findById(mat.typeID)
        .then(it => ({ ...mat, type: it }))
      )
  )

  console.log(JSON.stringify(materials, null, 2));
}

main().catch(e => console.error(e));
