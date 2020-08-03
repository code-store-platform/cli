import inquirer from 'inquirer';
import clear from 'clear';
import { Listr } from 'listr2';
import { yellow, blue, bold } from 'chalk';
import Command from '../../lib/command';
import { createPrefix } from '../../common/utils';

export default class Create extends Command {
  public static description = 'Creates a new project, where you can add services';

  public async execute(): Promise<void> {
    clear();

    const { name, description, proceed } = await inquirer.prompt([{
      name: 'name',
      message: 'Name:',
      prefix: createPrefix('What is your project\'s name?'),
      type: 'input',
    }, {
      name: 'description',
      message: 'Description:',
      prefix: createPrefix('Please add a short description of your project. 255 chars max'),
      type: 'input',
    }, {
      name: 'proceed',
      message: 'Is everything ok, can I create this project?',
      type: 'confirm',
    }]);

    if (!proceed) {
      this.log('Project has not been created');
      return;
    }

    const tasks = new Listr<{}>([{
      title: `Creating Project "${bold(name)}"`,
      task: async (ctx, task): Promise<void> => {
        const { uniqueName, name: projectName } = await this.codestore.Project.create({ name, description });

        // eslint-disable-next-line no-param-reassign
        task.title = `Your service "${bold(projectName)}" with ID ${blue(uniqueName)} has been created!
You can now add your services there using ${yellow(' codestore project:service ')} command.`;
      },
      options: { persistentOutput: true },
    }]);

    await tasks.run();
  }
}
