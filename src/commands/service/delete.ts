import { yellow } from 'chalk';
import * as inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  public static description = 'Remove service';

  public async execute(): Promise<void> {
    const { serviceId } = await this.serviceWorker.loadValuesFromYaml();

    const { result } = await inquirer.prompt([
      { name: 'result', message: `Are you sure you want to delete service with id ${serviceId}`, type: 'confirm' },
    ]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing service ${yellow(serviceId)}`,
        task: async (ctx, task): Promise<void> => {
          await this.codestore.Service.delete(serviceId);

          // eslint-disable-next-line no-param-reassign
          task.title = 'Service was successfully removed';
        },
      }]);

      await tasks.run();
    }
  }
}
