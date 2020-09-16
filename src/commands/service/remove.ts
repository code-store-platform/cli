import { flags } from '@oclif/command';
import { yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import Command from '../../lib/command';

export default class Remove extends Command {
  public static description = 'Remove a service';

  public static args = [
    { name: 'service_id', description: 'ID of the service (optional, if you\'re inside service folder)' },
  ];

  public static flags = {
    force: flags.boolean({
      char: 'f',
      default: false,
    }),
  };

  public async execute(): Promise<void> {
    const data = this.parse(Remove);
    let { args: { service_id: serviceId } } = data;
    let confirmed: boolean = data.flags.force;

    if (!serviceId) {
      serviceId = (await this.serviceWorker.loadValuesFromYaml()).serviceId;
    }

    if (!confirmed) {
      confirmed = (await inquirer.prompt([
        { name: 'result', message: `Are you sure you want to delete service with id ${serviceId}`, type: 'confirm' },
      ])).result;
    }

    if (confirmed) {
      const tasks = new Listr<{}>([{
        title: `Removing service ${yellow(serviceId)}`,
        task: async (ctx, task): Promise<void> => {
          // eslint-disable-next-line no-restricted-globals
          const isUniqueName = isNaN(serviceId);
          if (isUniqueName) {
            await this.codestore.Service.deleteByUniqueName(serviceId);
          } else {
            await this.codestore.Service.delete(serviceId);
          }

          // eslint-disable-next-line no-param-reassign
          task.title = 'Service was successfully removed';
        },
      }]);

      await tasks.run();
    }
  }
}
