import { yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Delete extends Command {
  public static description = 'Remove a service';

  public static args = [
    { name: 'service_id', description: 'ID of the service (optional, if you\'re inside service folder)' },
  ];

  public async execute(): Promise<void> {
    let { args: { service_id: serviceId } } = this.parse(Delete);

    if (!serviceId) {
      serviceId = (await this.serviceWorker.loadValuesFromYaml()).serviceId;
    }

    const { result } = await inquirer.prompt([
      { name: 'result', message: `Are you sure you want to delete service with id ${serviceId}`, type: 'confirm' },
    ]);

    if (result) {
      const tasks = new Listr<{}>([{
        title: `Removing service ${yellow(serviceId)}`,
        task: async (ctx, task): Promise<void> => {
          await this.codestore.Service.deleteByUniqueName(serviceId);

          // eslint-disable-next-line no-param-reassign
          task.title = 'Service was successfully removed';
        },
      }]);

      await tasks.run();
    }
  }
}
