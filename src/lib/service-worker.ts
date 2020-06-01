import { parse } from 'yaml';
import { join } from 'path';
import { validateSchemaFile } from '@graphql-schema/validate-schema';
import { DocumentNode } from 'graphql/language';
import PromisifiedFs from '../common/promisified-fs';
import IServiceConfig from '../interfaces/service-config.interface';

interface ValidatorResponse {
  source: string;
  schema: DocumentNode;
}

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

  public async validateSchema(): Promise<ValidatorResponse> {
    await this.getYamlPath();
    return validateSchemaFile(join(process.cwd(), 'schema.graphql'));
  }
}
