import inquirer from 'inquirer';
import Command from '../../lib/command';
import { WrongFolderError } from '../../lib/errors';
import { createPrefix } from '../../common/utils';

export default class Promote extends Command {
  public static description = 'Promotes service from private env to demo';

  public static args = [
    { name: 'service_id', description: 'ID of the service (optional)' },
  ];

  public async execute(): Promise<void> {
    let { args: { service_id: serviceId } } = this.parse(Promote);

    try {
      if (!serviceId) {
        serviceId = (await this.serviceWorker.loadValuesFromYaml()).serviceId;
      }
    } catch (error) {
      if (error.constructor === WrongFolderError) {
        const services = await this.codestore.Service.list();
        const map = new Map(services.map((s) => [
          `${s.id}\t${s.displayName}\t${s.problemSolving}`,
          s.id,
        ]));
        const { service } = await inquirer.prompt<{service: string}>([
          {
            type: 'list',
            name: 'service',
            message: 'Service:',
            prefix: createPrefix('Choose a service which you want to promote'),
            choices: Array.from(map).map((it) => it[0]),
          },
        ]);
        serviceId = map.get(service);
      }
    }

    await this.codestore.Service.promote(serviceId);

    this.log(`Successfully promoted service with id ${serviceId} to demo environment`);
  }
}
