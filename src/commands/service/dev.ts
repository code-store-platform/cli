import { logger } from 'codestore-utils';
import { Listr, ListrTask } from 'listr2';
import Command from '../../lib/command';
import { bootstrap } from '../../lib/launcher';
import { installDependencies } from '../../lib/child-cli';
import compile from '../../lib/compiler';

export const flow = (context: { localConfiguration; command: Command}): ListrTask[] => [
  {
    title: 'Installing dependencies',
    task: async (): Promise<void> => {
      await installDependencies();
    },
  },
  {
    title: 'Compiling code',
    task: async (): Promise<void> => {
      await compile(await context.command.serviceWorker.loadResolversPaths(), context.command);
    },
  },
];

export default class Dev extends Command {
  public static description = 'Launch your service locally';

  public static aliases = ['dev'];

  public async execute(): Promise<void> {
    const { localConfiguration } = await this.serviceWorker.loadValuesFromYaml();

    if (!localConfiguration) {
      throw new Error('Cannot find localConfiguration in codestore.yaml');
    }

    if (!localConfiguration || !localConfiguration.database) {
      throw new Error('There is no database configuration in codestore.yaml');
    }

    await new Listr<{}>(flow({ localConfiguration, command: this })).run();

    const { database, application } = localConfiguration;

    logger.log('Starting development server');

    await bootstrap({
      db: database,
      port: application.port,
    });
  }
}
