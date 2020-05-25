import * as inquirer from 'inquirer';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import FileWorker from '../../common/fileWorker';

export default class Pull extends Command {
  public static description = 'Create new service';

  public static aliases = [Aliases.PULL];

  public async execute() {
    const { serviceId } = await this.serviceWorker.loadValuesFromYaml();

    const { userAgreed } = await inquirer.prompt([
      {
        name: 'userAgreed', message: 'Are you sure you want to download latest uploaded code ? Your local changes will be overwritten', type: 'confirm', default: false,
      },
    ]);

    if (userAgreed) {
      const data = await this.codestore.Service.download(serviceId);

      await FileWorker.saveZipFromB64(data, process.cwd());
    }
  }
}
