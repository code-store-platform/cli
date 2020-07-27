import { yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  public static description = 'Removes the project (only if there are no more services inside)';

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
  ];

  public async execute(): Promise<void> {
    let { args: { project_id: projectId } } = this.parse(Delete);
    projectId = Number(projectId);

    const project = await this.codestore.Project.single(projectId);

    if (!project) {
      this.log('Seems like you are trying to remove project that not exist');
      return;
    }

    const { result } = await inquirer.prompt([{
      name: 'result',
      message: `Are you sure you want to delete project ${yellow(project.name)} (ID = ${yellow(project.id)}) ?`,
      type: 'confirm',
      default: false,
    }]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing project ${yellow(projectId)}`,
        task: async (ctx, task): Promise<void> => {
          await this.codestore.Project.delete(projectId);

          // eslint-disable-next-line no-param-reassign
          task.title = `Your project ${yellow(project.name)} with ID = ${yellow(project.id)} doesn't exist anymore.`;
        },
      }]);

      await tasks.run();
    } else {
      this.log(`Your project ${yellow(project.name)} with ID = ${yellow(project.id)} was not removed. It's still here. No worries.`);
    }
  }
}
