import inquirer from 'inquirer';
import { yellow, blue, yellowBright } from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/file-worker';

export default class Pull extends Command {
  public static description = 'Download an existing service';

  public static aliases = [Aliases.PULL];

  public static args = [
    { name: 'id' },
  ];

  private async getServiceId(args): Promise<{serviceId: number}> {
    if (args.id) {
      return { serviceId: +args.id };
    }
    try {
      return await this.serviceWorker.loadValuesFromYaml();
    } catch (error) {
      throw new Error(`🙅‍♀️ Oops! You must be in code.store service folder to invoke this command without arguments.
Use  ${yellow('cs service:pull ID')}  command to pull a service which doesn’t exist on your local machine yet.
⚠️ BE CAREFUL! Any local changes might be deleted and lost.`);
    }
  }

  public async execute(): Promise<void> {
    const { args } = this.parse(Pull);

    const { serviceId } = await this.getServiceId(args);

    const service = await this.codestore.Service.getService(serviceId);

    if (!service) {
      this.log(`👻 Damn! You've tried to download the service with ${yellowBright(`ID = ${serviceId}`)}, but there is no service with this ID!
 Check again by listing services you have using ${yellow('codestore service:list')} command, then try again.

 If you still experience this error, ping us here: ${blue('https://spectrum.chat/code-store')}`);
      return;
    }

    const { userAgreed } = await inquirer.prompt([
      {
        name: 'userAgreed', message: `⚠️ You're about to download '${service.name}' service with ID = ${service.id} to your local machine. All local changes, if any, will be overwritten. Go?`, type: 'confirm', default: false,
      },
    ]);

    if (userAgreed) {
      const data = await this.codestore.Service.download(serviceId);

      await FileWorker.saveZipFromB64(data, process.cwd());
    }
  }
}
