import { Hook } from '@oclif/config';
import * as path from 'path';
import UpdateChecker from '../../lib/update-checker/update-checker';

const debug = require('debug')('update-checker:hook');

// eslint-disable-next-line func-names
const hook: Hook<'init'> = async function ({ config }): Promise<void> {
  debug('running updater');
  const updater = new UpdateChecker(path.join(config.cacheDir, 'version'), config.version);
  await updater.check();
};

export default hook;
