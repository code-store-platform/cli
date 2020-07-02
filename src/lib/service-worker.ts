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
  private configFiles = {
    codestore: {
      filename: 'codestore.yaml',
      error: new Error('You must be in code.store service folder to invoke this command. Check if codestore.yaml and schema.graphql are exist'),
    },
    schema: {
      filename: 'src/schema.graphql',
      error: new Error('Cannot find schema.graphql, restore it or use cs pull'),
    },
  };

  private async load(configName: 'codestore' | 'schema'): Promise<string> {
    const { filename, error } = this.configFiles[configName];
    const path = join(process.cwd(), filename);
    try {
      await PromisifiedFs.access(path);
      return path;
    } catch (e) {
      throw error;
    }
  }

  public async loadValuesFromYaml(): Promise<IServiceConfig> {
    const configPath = await this.load('codestore');
    const file = await PromisifiedFs.readFile(configPath);

    return parse(file.toString()) as IServiceConfig;
  }

  public async validateSchema(): Promise<ValidatorResponse> {
    const schemaPath = await this.load('schema');
    return validateSchemaFile(schemaPath);
  }
}
