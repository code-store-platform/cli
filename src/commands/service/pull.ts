import inquirer from 'inquirer';
import {
  yellow, blue, yellowBright, red,
} from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';
import { WrongFolderError } from '../../lib/errors';
import { IService } from '../../interfaces/service.interface';

export default class Pull extends Command {
  public static description = 'Download an existing service';

  public static aliases = [Aliases.PULL];

  public static args = [
    { name: 'service_id', description: 'ID of the service (optional, if you\'re inside service folder)' },
  ];

  public async execute(): Promise<void> {
    let { args: { service_id: serviceId } } = this.parse(Pull);

    if (!serviceId) {
      try {
        serviceId = Number((await this.serviceWorker.loadValuesFromYaml()).serviceId);
      } catch (error) {
        if (error.constructor === WrongFolderError) {
          this.log(`You must be in code.store service folder to invoke this command without arguments.
Use ${yellow(' codestore service:pull [SERVICE_ID] ')} command to pull a service which doesn’t exist on your local machine yet.

${red('BE CAREFUL! Any local changes might be deleted and lost')}`);
        }
        return;
      }
    }

    let service: IService;
    if (typeof serviceId === 'string') {
      service = await this.codestore.Service.getServiceByUniqueName(serviceId);
    } else {
      service = await this.codestore.Service.getService(serviceId);
    }

    if (!service) {
      this.log(`You've tried to download the service with ${yellowBright(`ID = ${serviceId}`)}, but there is no service with this ID!
 Check again by listing services you have using ${yellow(' codestore service:list ')} command, then try again.

 If you still experience this error, ping us in our community here: ${blue('https://spectrum.chat/code-store')}`);
      return;
    }

    const { userAgreed } = await inquirer.prompt([
      {
        name: 'userAgreed', message: `You're about to download service with ID = ${service.uniqueName} to your local machine. All local changes, if any, will be overwritten. Go?`, type: 'confirm', default: false,
      },
    ]);

    if (userAgreed) {
      const data = await this.codestore.Service.download(service.id);

      await FileWorker.saveZipFromB64(data, process.cwd());
    }
  }
}
