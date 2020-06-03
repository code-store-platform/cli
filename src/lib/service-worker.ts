import { parse } from 'yaml';
import { join } from 'path';
import PromisifiedFs from '../common/promisified-fs';
import IServiceConfig from '../interfaces/service-config.interface';

export default class ServiceWorker {
  private configFileName = 'codestore.yaml';

  private async getYamlPath(): Promise<string> {
    const path = join(process.cwd(), this.configFileName);

    try {
      await PromisifiedFs.access(path);
      return path;
    } catch (e) {
      throw new Error('You must be in code.store service folder to invoke this command');
    }
  }

  public async loadValuesFromYaml(): Promise<IServiceConfig> {
    const pathToConfig = await this.getYamlPath();
    const file = await PromisifiedFs.readFile(pathToConfig);

    return parse(file.toString()) as IServiceConfig;
  }
}
