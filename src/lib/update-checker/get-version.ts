import { PromisifiedFs } from 'codestore-utils';
import latestVersion from 'latest-version';

const debug = require('debug')('update-checker:get-version');

async function run(file: string, version: string): Promise<void> {
  debug('getting the latest version');
  const latest = await latestVersion('codestore');
  debug(`got response from npmjs: ${latest}`);

  debug(`writing to file: ${JSON.stringify({ latest, current: version })}`);
  await PromisifiedFs.writeFile(file, JSON.stringify({ latest, current: version }));

  process.exit(0);
}

// eslint-disable-next-line import/no-extraneous-dependencies
run(process.argv[2], process.argv[3]).catch(require('@oclif/errors/handle'));
