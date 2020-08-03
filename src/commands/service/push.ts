import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { generateFlow } from './generate';
import { createPrefix } from '../../common/utils';

export default class Push extends Command {
  public static description = 'Push local changes to Private environment';

  public static aliases = [Aliases.PUSH];

  private splitNotes = (notes: string): string[] => notes.split(';');

  public async execute(): Promise<void> {
    await this.serviceWorker.loadValuesFromYaml();

    const { releaseNotes, description } = await inquirer.prompt([
      {
        name: 'description',
        message: 'Description:',
        validate: (value): string | boolean => {
          if (!value || this.splitNotes(value).length < 1) {
            return 'At least one note is required';
          }
          return true;
        },
        prefix: createPrefix('Please enter a short description of your changes'),
      },
      {
        name: 'releaseNotes',
        message: 'Notes:',
        validate: (value): string | boolean => {
          if (!value || this.splitNotes(value).length < 1) {
            return 'At least one note is required';
          }
          return true;
        },
        prefix: createPrefix('Please enter release notes (semicolon separated)'),
      },
    ]);

    const { error } = this;
    const generate = generateFlow(this, error);

    // need to change only one step
    const uploadToGeneratorIndex = generate.findIndex((task) => task.title === 'Uploading service to the generator');
    generate.splice(uploadToGeneratorIndex, 1, {
      title: 'Pushing service',
      task: async (ctx, task): Promise<void> => {
        const { encodedZip } = ctx;
        ctx.generated = await this.codestore.Service.push(encodedZip, this.splitNotes(releaseNotes), description);

        if (ctx.generated) {
          // eslint-disable-next-line no-param-reassign
          task.title = 'Service has been pushed';
        }
      },
    });

    const tasks = new Listr<{ encodedZip: string; generated: string }>(generate);

    await tasks.run();
  }
}
