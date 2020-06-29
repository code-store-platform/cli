import inquirer from 'inquirer';
import { flags } from '@oclif/command';
import clear from 'clear';
import { Listr } from 'listr2';
import { yellow } from 'chalk';
import Command from '../../lib/command';
import { createSuffix } from '../../common/utils';

export default class Create extends Command {
  public static description = 'Creates a new project, where you can add services';

  public static flags = {
    name: flags.string({
      description: 'Name of the project',
    }),
    identifier: flags.string({
      description: 'Unique identifier of the project. Can contain only a-z, _ and - characters',
    }),
    description: flags.string({
      description: 'Description of the project',
    }),
  };

  public async execute(): Promise<void> {
    clear();

    const { name, proceed } = await inquirer.prompt([
      { name: 'name', message: 'What is your project\'s name?' },
      { name: 'description', message: 'Please add a short description of your project', suffix: createSuffix('255 chars max') },
      { name: 'proceed', message: 'Is everything ok, can I create this project?', type: 'confirm' },
    ]);

    if (!proceed) {
      this.log('Project has not been created');
      return;
    }

    const tasks = new Listr<{}>([{
      title: `Creating Project ${yellow(name)}`,
      task: async (ctx, task): Promise<void> => {
        const { id, name: projectName } = await this.codestore.Project.create(name);

        // eslint-disable-next-line no-param-reassign
        task.title = `🙌 Made it, Ma! Your service ${projectName} with ID = ${id} has been created ! You can now add your services there using codestore project:service command.`;
      },
      options: { persistentOutput: true },
    }]);

    await tasks.run();
  }
}
