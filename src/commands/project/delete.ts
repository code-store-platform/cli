import { yellow } from 'chalk';
import * as inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  static description = 'Remove project';

  static args = [
    { name: 'id' },
  ];

  async execute() {
    const { args: { id } } = this.parse(Delete);
    if (!id) {
      throw new Error('Id flag is required, please use cs project:delete {id}');
    }

    const { result } = await inquirer.prompt([
      { name: 'result', message: `Are you sure you want to delete project with id ${id}`, type: 'confirm' },
    ]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing project ${yellow(id)}`,
        task: async (ctx, task) => {
          await this.codestore.Project.delete(+id);

          // eslint-disable-next-line no-param-reassign
          task.title = 'Project was successfully removed';
        },
      }]);

      await tasks.run();
    }
  }
}
