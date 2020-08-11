import { parse } from 'yaml';
import { validateSchemaFile } from '@graphql-schema/validate-schema';
import { DocumentNode } from 'graphql/language';
import { yellow } from 'chalk';
import PromisifiedFs from '../common/promisified-fs';
import IServiceConfig from '../interfaces/service-config.interface';
import Paths, { join } from '../common/constants/paths';
import { WrongFolderError } from './errors';

interface ValidatorResponse {
  source: string;
  schema: DocumentNode;
}

export default class ServiceWorker {
  private configFiles = {
    codestore: {
      path: join(Paths.ROOT, 'codestore.yaml'),
      error: new WrongFolderError('You must be in code.store service folder to invoke this command.\nCheck if codestore.yaml and schema.graphql are exist'),
    },
    schema: {
      path: join(Paths.SRC, 'schema.graphql'),
      error: new WrongFolderError(`Cannot find schema.graphql, make sure that you invoke this command from the service folder or use ${yellow(' cs service:pull ')} to restore your graphql.schema.`),
    },
  };

  private async load(configName: 'codestore' | 'schema'): Promise<string> {
    const { path, error } = this.configFiles[configName];
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

  public async loadResolversPaths(): Promise<string[]> {
    const basePath = join(process.cwd(), 'src', 'resolvers');
    const queriesPath = join(basePath, 'queries');
    const mutationsPath = join(basePath, 'mutations');

    const queries = await PromisifiedFs.readdir(queriesPath).then((data) => data
      .filter((file) => /.ts$/.test(file))
      .map((file) => join(queriesPath, file)));
    const mutations = await PromisifiedFs.readdir(mutationsPath).then((data) => data
      .filter((file) => /.ts$/.test(file))
      .map((file) => join(mutationsPath, file)));

    return [...queries, ...mutations, join(process.cwd(), 'src', 'resolvers', 'resolvers.ts')];
  }
}
