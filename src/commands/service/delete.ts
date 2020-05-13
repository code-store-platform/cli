import { yellow } from 'chalk';
import * as inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  static description = 'Remove service';

  static args = [
    { name: 'id' },
  ];

  async execute() {
    const { args: { id } } = this.parse(Delete);
    if (!id) {
      throw new Error('Id flag is required, please use cs service:delete {id}');
    }

    const { result } = await inquirer.prompt([
      { name: 'result', message: `Are you sure you want to delete service with id ${id}`, type: 'confirm' },
    ]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing service ${yellow(id)}`,
        task: async (ctx, task) => {
          await this.codestore.Service.delete(+id);

          // eslint-disable-next-line no-param-reassign
          task.title = 'Service was successfully removed';
        },
      }]);

      await tasks.run();
    }
  }
}
