import { Listr, ListrTask } from 'listr2';
import { yellow } from 'chalk';
import clear from 'clear';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';
import PromisifiedFs from '../../common/promisified-fs';
import Paths from '../../common/constants/paths';
import { revertMigration, runMigration, compile } from '../../lib/child-cli';

const firstLine = (str: string): string => str.split('\n')[0].replace(/:$/, '');

export const generateFlow = (context: Command, error: (input: string | Error, options?: { exit: number }) => void): ListrTask[] => [
  {
    title: 'Validating schema',
    task: async (): Promise<void> => {
      await context.serviceWorker.validateSchema();
    },
  },
  {
    title: 'Compiling your code',
    task: async (): Promise<void> => {
      await PromisifiedFs.rimraf(Paths.DIST);
      await compile();
    },
  },
  {
    title: 'Preparing the service code for upload',
    task: async (ctx): Promise<void> => {
      await PromisifiedFs.createFolderIfNotExist(Paths.MIGRATIONS);
      await PromisifiedFs.createFolderIfNotExist(Paths.ENTITIES);
      ctx.encodedZip = await FileWorker.zipFolder();
    },
  },
  {
    title: 'Reverting extra migrations',
    task: async (ctx, task): Promise<void> => {
      const currentMigrations = await PromisifiedFs.readdir(Paths.MIGRATIONS);
      const migrationsInGit = await context.codestore.Service.getMigrations(ctx.encodedZip);

      for (let i = 0; i < migrationsInGit.length; i += 1) {
        if (migrationsInGit[i] !== currentMigrations[i]) {
          error(`Your migrations don't match migrations in the repository, please try ${yellow('cs pull')}`, { exit: 1 });
        }
      }
      try {
        for (let i = currentMigrations.length - 1; i >= migrationsInGit.length; i -= 1) {
          // eslint-disable-next-line no-await-in-loop
          await revertMigration();
        }
        // eslint-disable-next-line no-param-reassign
        task.title = 'Extra migrations were successfully reverted';
      } catch (e) {
        task.skip(`Migrations were not reverted: ${firstLine(e.toString())}`);
      }
    },
  },
  {
    title: 'Uploading service to the generator',
    task: async (ctx): Promise<void> => {
      const { encodedZip } = ctx;
      ctx.generated = await context.codestore.Service.generateEntities(encodedZip);
    },
  },
  {
    title: 'Saving generated code',
    task: async (ctx, task): Promise<void> => {
      const { generated } = ctx;
      if (!generated) {
        error('An error occured', { exit: 1 });
      }

      await PromisifiedFs.rimraf(Paths.MIGRATIONS);
      await PromisifiedFs.rimraf(Paths.ENTITIES);
      await PromisifiedFs.rimraf(Paths.DIST);
      await FileWorker.saveZipFromB64(generated, Paths.DATA);
      await compile();

      // eslint-disable-next-line no-param-reassign
      task.title = 'Generated code has been saved';
    },
  },
  {
    title: 'Running generated migration',
    task: async (ctx, task): Promise<void> => {
      try {
        await runMigration();

        // eslint-disable-next-line no-param-reassign
        task.title = 'Migration ran successfully';
      } catch (e) {
        task.skip(`Migrations were not ran: ${firstLine(e.toString())}`);
      }
    },
  },
];

export default class Generate extends Command {
  public static description = 'Generate entities and migrations';

  public static aliases = [Aliases.GENERATE];

  public async execute(): Promise<void> {
    const { error } = this;

    const tasks = new Listr<{ encodedZip: string; generated: string }>(generateFlow(this, error));

    try {
      await tasks.run();
    } catch (e) {
      clear();
      throw e;
    }
  }
}
