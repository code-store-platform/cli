import { Listr } from 'listr2';
import { join } from 'path';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';
import PromisifiedFs from '../../common/promisified-fs';

export default class Generate extends Command {
  public static description = 'Generate entities and migrations';

  public static aliases = [Aliases.GENERATE];

  public async execute(): Promise<void> {
    await this.serviceWorker.validateSchema();

    const tasks = new Listr<{ encodedZip: string; generated: string }>([
      {
        title: 'Validating schema',
        task: async (): Promise<void> => {
          await this.serviceWorker.validateSchema();
        },
      },
      {
        title: 'Preparing the service code for upload',
        task: async (ctx): Promise<void> => {
          ctx.encodedZip = await FileWorker.zipFolder();
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
          const dataFolder = join(process.cwd(), 'src', 'data');
          await PromisifiedFs.rimraf(join(dataFolder, 'entities'));
          await FileWorker.saveZipFromB64(generated, dataFolder);

          // eslint-disable-next-line no-param-reassign
          task.title = 'Generated code has been saved';
        },
      },
    ]);

    await tasks.run();
  }
}
