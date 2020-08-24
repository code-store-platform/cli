import { parse } from 'yaml';
import { loadSchema } from '@graphql-tools/load';
import {
  validate, buildSchema, introspectionFromSchema, parse as graphqlParse,
} from 'graphql';
import { yellow } from 'chalk';
import { PromisifiedFs } from 'codestore-utils';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import IServiceConfig from '../interfaces/service-config.interface';
import Paths, { join } from '../common/constants/paths';
import { WrongFolderError } from './errors';
import GraphqlLoader from './launcher/GraphQLLoader';
import { loadSchemaFields, findDiff } from '../common/utils';

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

  public async validateSchema(): Promise<void> {
    const schemaPath = await this.load('schema');
    const loadSchemaOptions = { loaders: [new GraphQLFileLoader()] };
    const schema = await loadSchema(schemaPath, loadSchemaOptions);
    const documentAST = graphqlParse(await PromisifiedFs.readFile(schemaPath, 'utf8'));
    validate(schema, documentAST);
  }

  public async validateQueriesAndMutations(): Promise<void> {
    const data = await PromisifiedFs.readFile(await this.load('schema'));

    const schema = buildSchema(data.toString());

    const introspection = introspectionFromSchema(schema);

    const loadedSchemaQueries = loadSchemaFields(introspection, 'Query');
    const loadedSchemaMutations = loadSchemaFields(introspection, 'Mutation');

    const { queryResolvers, mutationResolvers } = await new GraphqlLoader().getResolversInArray();

    const queriesErrors = findDiff(queryResolvers, loadedSchemaQueries);
    const mutationsErrors = findDiff(mutationResolvers, loadedSchemaMutations);

    if (queriesErrors && queriesErrors.length) {
      throw new Error(`${queriesErrors} queries are not defined in schema`);
    }

    if (mutationsErrors && mutationsErrors.length) {
      throw new Error(`${mutationsErrors} mutations are not defined in schema`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
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
