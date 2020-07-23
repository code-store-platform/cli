import { promisify } from 'util';
import ChildProcess from 'child_process';

const exec = promisify(ChildProcess.exec);

const runCommand = async (command): Promise<string> => {
  const { stdout, stderr } = await exec(command);
  if (stderr) throw new Error(stderr);
  return stdout;
};

const compile = (): Promise<string> => runCommand('tsc');

const runMigration = (): Promise<string> => runCommand('npm run migration:run');

const revertMigration = (): Promise<string> => runCommand('npm run migration:revert');

const installDependencies = (serviceName: string): Promise<string> => runCommand(`cd ${serviceName} && npm i`);

export {
  compile,
  runMigration,
  revertMigration,
  installDependencies,
};
