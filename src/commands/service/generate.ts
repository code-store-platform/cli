import { Listr } from 'listr2';
import { yellow } from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';
import PromisifiedFs from '../../common/promisified-fs';
import Paths from '../../common/constants/paths';
import { revertMigration, runMigration, compile } from '../../lib/child-cli';

export default class Generate extends Command {
  public static description = 'Generate entities and migrations';

  public static aliases = [Aliases.GENERATE];

  public async execute(): Promise<void> {
    const { error } = this;

    const tasks = new Listr<{ encodedZip: string; generated: string }>([
      {
        title: 'Validating schema',
        task: async (): Promise<void> => {
          await this.serviceWorker.validateSchema();
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
          ctx.encodedZip = await FileWorker.zipFolder();
        },
      },
      {
        title: 'Reverting extra migrations',
        task: async (ctx, task): Promise<void> => {
          await PromisifiedFs.createFolderIfNotExist(Paths.MIGRATIONS);
          const currentMigrations = await PromisifiedFs.readdir(Paths.MIGRATIONS);
          const migrationsInGit = await this.codestore.Service.getMigrations(ctx.encodedZip);

          for (let i = 0; i < migrationsInGit.length; i += 1) {
            if (migrationsInGit[i] !== currentMigrations[i]) {
              error(`Your migrations don't match migrations in the repository, please try ${yellow('cs pull')}`, { exit: 1 });
            }
          }

          for (let i = currentMigrations.length - 1; i >= migrationsInGit.length; i -= 1) {
            // eslint-disable-next-line no-await-in-loop
            await revertMigration();
          }

          // eslint-disable-next-line no-param-reassign
          task.title = 'Extra migrations were successfully reverted';
        },
      },
      {
        title: 'Uploading service',
        task: async (ctx): Promise<void> => {
          const { encodedZip } = ctx;
          ctx.generated = await this.codestore.Service.generateEntities(encodedZip);
        },
      },
      {
        title: 'Saving generated code',
        task: async (ctx, task): Promise<void> => {
          const { generated } = ctx;
          await PromisifiedFs.rimraf(Paths.DATA);
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
          await runMigration();

          // eslint-disable-next-line no-param-reassign
          task.title = 'Migration ran successfully';
        },
      },
    ]);

    await tasks.run();
  }
}
