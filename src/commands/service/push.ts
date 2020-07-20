import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { generateFlow } from './generate';

export default class Push extends Command {
  public static description = 'Push local changes to Private environment';

  public static aliases = [Aliases.PUSH];

  private splitNotes = (notes: string): string[] => notes.split(';');

  public async execute(): Promise<void> {
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

    const { error } = this;
    const generate = generateFlow(this, error);

    // need to change only one step
    const uploadToGeneratorIndex = generate.findIndex((task) => task.title === 'Uploading service to the generator');
    generate.splice(uploadToGeneratorIndex, 1, {
      title: 'Pushing service',
      task: async (ctx, task): Promise<void> => {
        const { encodedZip } = ctx;
        ctx.generated = await this.codestore.Service.push(encodedZip, this.splitNotes(releaseNotes));

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
