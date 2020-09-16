import { Listr, ListrTask } from 'listr2';
import clear from 'clear';
import { yellow } from 'chalk';
import {
  PromisifiedFs, compile, PathsResolverTool, GraphqlValidatorTool,
} from 'codestore-utils';
import { Connection } from 'typeorm';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';
import { installDependencies } from '../../lib/child-cli';
import { generateChecksumForFile } from '../../common/utils';

const firstLine = (str: string): string => str.split('\n')[0].replace(/:$/, '').replace(/error: /g, '');

export const migrationsAreActual = async (context: Command): Promise<boolean> => {
  const checksum = await generateChecksumForFile(context.serviceWorker.schemaPath);

  const migrations = await PromisifiedFs.readdir(PathsResolverTool.MIGRATIONS);
  const lastMigration = migrations.pop();
  const lastMigrationChecksum = lastMigration?.split('_')?.[1]?.replace(/\.ts/g, '');

  return checksum === lastMigrationChecksum;
};

export const generateFlow = (context: Command, error: (input: string | Error, options?: { exit: number }) => void): ListrTask[] => [
  {
    title: 'Compiling your code',
    task: async (): Promise<void> => {
      await installDependencies();
      await compile(await PathsResolverTool.loadFilesToCompile());
    },
  },
  {
    title: 'Validating schema',
    task: async (): Promise<void> => {
      await GraphqlValidatorTool.validateSchema();
      if (context.id !== 'service:generate') {
        await GraphqlValidatorTool.validateQueriesAndMutations();
      }
    },
  },
  {
    title: 'Preparing the service code for upload',
    task: async (ctx): Promise<void> => {
      await PromisifiedFs.createFolderIfNotExist(PathsResolverTool.MIGRATIONS);
      await PromisifiedFs.createFolderIfNotExist(PathsResolverTool.ENTITIES);
      await PromisifiedFs.rimraf(PathsResolverTool.BUILD);
      ctx.encodedZip = await FileWorker.zipFolder();
    },
  },
  {
    title: 'Reverting extra migrations',
    task: async (ctx, task): Promise<void> => {
      const skip = (e: Error): void => {
        task.skip(`Migrations were not reverted: ${firstLine(e.toString())}`);
      };

      // eslint-disable-next-line no-param-reassign
      task.output = 'Creating connection to database';

      let connection: Connection;
      try {
        connection = await context.getDatabaseConnection();
      } catch (e) {
        skip(e);
        return;
      }

      const currentMigrations = (await PromisifiedFs.readdir(PathsResolverTool.MIGRATIONS))
        .filter((name) => /\.ts$/.test(name));

      // eslint-disable-next-line no-param-reassign
      task.output = 'Getting migrations from latest uploaded service version';

      const migrationsInGit = await context.codestore.Service.getMigrations(ctx.encodedZip);

      for (let i = 0; i < migrationsInGit.length; i += 1) {
        if (migrationsInGit[i] !== currentMigrations[i]) {
          error(`Your migrations don't match migrations in the repository, please try ${yellow('cs pull')}`, { exit: 1 });
        }
      }

      try {
        if (await migrationsAreActual(context)) {
          // eslint-disable-next-line no-param-reassign
          task.title = 'Your migrations are up to date';
        } else {
          // eslint-disable-next-line no-param-reassign
          task.output = 'Removing migrations';

          for (let i = currentMigrations.length - 1; i >= migrationsInGit.length; i -= 1) {
            // eslint-disable-next-line no-await-in-loop
            await connection.undoLastMigration();
          }

          // eslint-disable-next-line no-param-reassign
          task.title = 'Extra migrations were successfully reverted';
        }
      } catch (e) {
        skip(e);
      } finally {
        await connection.close();
      }
    },
    options: {
      bottomBar: true,
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

      await PromisifiedFs.rimraf(PathsResolverTool.MIGRATIONS);
      await PromisifiedFs.rimraf(PathsResolverTool.ENTITIES);
      await PromisifiedFs.rimraf(PathsResolverTool.DIST);
      await PromisifiedFs.rimraf(PathsResolverTool.BUILD);
      await FileWorker.saveZipFromB64(generated, PathsResolverTool.DATA);
      await compile(await PathsResolverTool.loadFilesToCompile());

      // eslint-disable-next-line no-param-reassign
      task.title = 'Generated code has been saved';
    },
  },
];

export default class Generate extends Command {
  public static description = 'Generate entities and migrations';

  public static aliases = [Aliases.GENERATE];

  public async execute(): Promise<void> {
    if (await migrationsAreActual(this)) {
      this.log('Your code is up to date with the current schema, generation is not needed.');
      return;
    }

    const { error } = this;
    const tasks = new Listr<{ encodedZip: string; generated: string }>(generateFlow(this, error));

    await tasks.run();
  }
}
