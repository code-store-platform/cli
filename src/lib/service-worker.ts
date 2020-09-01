import { parse } from 'yaml';
import { yellow } from 'chalk';
import { PromisifiedFs } from 'codestore-utils';
import IServiceConfig from '../interfaces/service-config.interface';
import Paths, { join } from '../common/constants/paths';
import { WrongFolderError } from './errors';

export default class ServiceWorker {
  private configFiles = {
    codestore: {
      path: join(Paths.ROOT, 'codestore.yaml'),
      error: new WrongFolderError('You must be in code.store service root folder to invoke this command.\nCheck if codestore.yaml and schema.graphql exist.'),
    },
    schema: {
      path: join(Paths.SRC, 'schema.graphql'),
      error: new WrongFolderError(`Cannot find schema.graphql, make sure that you invoke this command from the service root folder or use ${yellow('cs service:pull')} to restore your graphql.schema.`),
    },
  };

  public get schemaPath(): string {
    return this.configFiles.schema.path;
  }

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

  public async loadEntitiesAndMutationsPaths(): Promise<string[]> {
    const entities = join(process.cwd(), 'src', 'data', 'entities');
    const migrations = join(process.cwd(), 'src', 'data', 'migrations');

    const entitiesPaths = await this.loadFilePaths(entities);
    const migrationsPaths = await this.loadFilePaths(migrations);

    return [
      ...entitiesPaths, ...migrationsPaths,
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  private async loadFilePaths(path: string): Promise<string[]> {
    try {
      return await PromisifiedFs.readdir(path).then((data) => data
        .filter((file) => /.ts$/.test(file))
        .map((file) => join(path, file)));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      return [];
    }
  }
}
