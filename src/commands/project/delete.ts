import { yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  public static description = 'Removes project (only if there are no more services inside)';

  public static args = [
    { name: 'id' },
  ];

  public async execute(): Promise<void> {
    const { args: { id } } = this.parse(Delete);

    if (!id) {
      this.error('🤦 You\'re gonna need a bigger boat. To delete a project, you need to specify it\'s ID. Example: codestore project:delete 42 will delete the project with ID = 42. \n'
        + 'To see what\'s your project ID is you can execute codestore project:list');

      return;
    }

    const project = await this.codestore.Project.single(+id);

    if (!project) {
      this.error('Seems like you are trying to remove project that not exist');
      return;
    }

    const { result } = await inquirer.prompt([
      {
        name: 'result', message: `⚠️ It's alive! It's alive! Are you sure you want to delete project ${yellow(project.name)} (ID = ${yellow(project.id)}) ?`, type: 'confirm', default: false,
      },
    ]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing project ${yellow(id)}`,
        task: async (ctx, task): Promise<void> => {
          await this.codestore.Project.delete(+id);

          // eslint-disable-next-line no-param-reassign
          task.title = `⚰️ Elementary, my dear Watson. Your project ${yellow(project.name)} with ID = ${yellow(project.id)} doesn't exist anymore.`;
        },
      }]);

      await tasks.run();
    } else {
      this.log(`😌 My precious. Your project ${yellow(project.name)} with ID = ${yellow(project.id)} was not removed. It's still here. No worries.`);
    }
  }
}
