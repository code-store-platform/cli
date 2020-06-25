import { yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  public static description = 'Remove project';

  public static args = [
    { name: 'id', required: true },
  ];

  public async execute(): Promise<void> {
    const { args: { id } } = this.parse(Delete);

    const { result } = await inquirer.prompt([
      { name: 'result', message: `Are you sure you want to delete project with id ${id}`, type: 'confirm' },
    ]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing project ${yellow(id)}`,
        task: async (ctx, task): Promise<void> => {
          await this.codestore.Project.delete(+id);

          // eslint-disable-next-line no-param-reassign
          task.title = 'Project was successfully removed';
        },
      }]);

      await tasks.run();
    }
  }
}
