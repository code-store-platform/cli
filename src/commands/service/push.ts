import * as inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';

export default class Push extends Command {
  public static description = 'Create new service';

  public static aliases = [Aliases.PUSH];

  private splitNotes = (notes: string): string[] => notes.split(';') ;

  public async execute(): Promise<void> {
    await this.serviceWorker.validateSchema();

    const { releaseNotes } = await inquirer.prompt([
      {
        name: 'releaseNotes',
        message: 'Please enter release notes (semicolon separated)',
        validate: (value): string | boolean => {
          if (!value || this.splitNotes(value).length < 1) {
            return 'At least one note is required';
          }
          return true;
        },
        prefix: '(optional)',
      },
    ]);

    const tasks = new Listr<{encodedZip: string}>([
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
        task: async (ctx, task): Promise<void> => {
          const { encodedZip } = ctx;
          console.log(encodedZip);
          // const result = await this.codestore.Service.push(encodedZip, this.splitNotes(releaseNotes));

          if (result) {
            // eslint-disable-next-line no-param-reassign
            task.title = 'Service has been uploaded';
          }
        },
      },
    ]);

    await tasks.run();
  }
}
