import { blue } from 'chalk';
import Command from '../../lib/command';
import { WrongFolderError } from '../../lib/errors';
import IService from '../../interfaces/service.interface';

export default class Promote extends Command {
  public static description = 'Promotes service from private env to demo';

  public static args = [
    { name: 'serviceArg', description: 'ID of the service (optional)' },
  ];

  public async execute(): Promise<void> {
    const { args } = this.parse(Promote);
    let { serviceArg: serviceId } = args;

    try {
      if (!serviceId) {
        serviceId = Number((await this.serviceWorker.loadValuesFromYaml()).serviceId);
      }
    } catch (error) {
      if (error.constructor === WrongFolderError) {
        const service = await this.chooseService(args, 'Choose a service which you want to promote');
        if (!service) return;
        serviceId = service.id;
      }
    }

    try {
      let service: IService;
      if (typeof serviceId === 'string') {
        service = await this.codestore.Service.promoteByUniqueName(serviceId);
      } else {
        service = await this.codestore.Service.promote(serviceId);
      }

      this.log(`Successfully promoted service with ID ${blue(service.uniqueName)} to demo environment`);
    } catch (error) {
      this.log(error.message);
    }
  }
}
