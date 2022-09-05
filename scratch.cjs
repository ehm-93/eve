const { TypeApi } = require('@emmettsdomain/eve-sde-client');

const YAML = require('js-yaml');

async function main() {
  const types = new TypeApi({ path: '/workspace/eve/data/sde/fsd/typeIDs.yaml' });
  const x = await types.findByName('en', 'Moa');
  const y = await types.findByGroupId(x[0].groupID);
  console.log('type', x);
  console.log('group', y.slice(0, 10));
}

main().catch(e => console.error(e));
