const { TypeApi } = require('@emmettsdomain/eve-sde-client');

const YAML = require('js-yaml');

async function main() {
  const types = new TypeApi({ path: '/workspace/eve/data/sde/fsd/typeIDs.yaml' });
  const x = await types.findById(371027);
  const y = await types.findByGroupId(x.groupID);
  console.log('type', x);
  console.log('group', y.slice(0, 2));
}

main().catch(e => console.error(e));
