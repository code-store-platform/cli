import { promisify } from 'util';
import ChildProcess from 'child_process';
import ChildCliError from './child-cli.error';

const exec = promisify(ChildProcess.exec);

const runCommand = async (command): Promise<void> => {
  try {
    await exec(command);
  } catch (error) {
    throw new ChildCliError(error.stdout, command);
  }
};

const compile = (): Promise<void> => runCommand('tsc');

const runMigration = (): Promise<void> => runCommand('npm run migration:run');

const revertMigration = (): Promise<void> => runCommand('npm run migration:revert');

const installDependencies = (serviceName: string): Promise<void> => runCommand(`cd ${serviceName} && npm install`);

export {
  compile,
  runMigration,
  revertMigration,
  installDependencies,
};
