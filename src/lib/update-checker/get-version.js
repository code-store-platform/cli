const latestVersion = require('latest-version');
const { PromisifiedFs: fs } = require('codestore-utils');

const debug = require('debug')('update-checker:get-version');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function run(file, version) {
  debug('getting the latest version');
  const latest = await latestVersion('codestore');
  debug(`got response from npmjs: ${latest}`);

  debug(`writing to file: ${JSON.stringify({ latest, current: version })}`);
  await fs.writeFile(file, JSON.stringify({ latest, current: version }));

  process.exit(0);
}

// eslint-disable-next-line import/no-extraneous-dependencies
run(process.argv[2], process.argv[3]).catch(require('@oclif/errors/handle'));
