import path, { join } from 'path';
import fs from 'fs';
import { gql, IResolvers } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import { logger } from 'codestore-utils';
import { IResolver } from './interfaces/graphql.interface';
import paths from '../../common/constants/paths';

export default class GraphqlLoader {
  // private resolversPath = join(process.cwd(), 'src', 'resolvers');

  private schemaPath = join(process.cwd(), 'src', 'schema.graphql');

  private resolversPath = join(paths.BUILD, 'resolvers');

  private resolvers: IResolvers = {};

  private getResolverName = (file): string => path.parse(file).name;

  private async loadResolversFromDir(folder: string): Promise<IResolver| null> {
    const normalizedPath = path.join(this.resolversPath, folder);

    let files;

    try {
      files = fs.readdirSync(normalizedPath).filter((file) => /.js$/.test(file));
    } catch (e) {
      if (e?.code !== 'ENOENT') {
        logger.error(e, undefined, this.constructor.name);
      }
      return null;
    }

    const resolversArray: IResolver[] = await Promise.all(files.map(async (it) => ({
      [this.getResolverName(it)]: await import(path.join(normalizedPath, it)),
    })));

    const reducedResolversObject = resolversArray.reduce((prev, next) => {
      const name = Object.keys(next)[0];
      const value: any = Object.values(next)[0];

      if (!value.default) {
        return {
          ...prev,
        };
      }

      return {
        ...prev,
        [name]: value.default,
      };
    }, {});

    if (Object.keys(reducedResolversObject).length) {
      return reducedResolversObject;
    }
    return null;
  }

  private async loadResolversFromFile(): Promise<void> {
    const resolversFile = await import(path.join(this.resolversPath, 'resolvers.js'));

    this.resolvers.Query = {
      ...this.resolvers.Query,
      ...resolversFile.default.Query,
    };

    if (Object.keys(resolversFile.default.Mutation).length) {
      this.resolvers.Mutation = {
        ...this.resolvers.Mutation,
        ...resolversFile.default.Mutation,
      };
    }
  }

  private async loadResolvers(): Promise<void> {
    const query = await this.loadResolversFromDir('queries');
    const mutation = await this.loadResolversFromDir('mutations');

    if (query) {
      this.resolvers.Query = query;
    }
    if (mutation) {
      this.resolvers.Mutation = mutation;
    }

    await this.loadResolversFromFile();
  }

  public async getResolvers(): Promise<IResolvers> {
    await this.loadResolvers();

    const context = this.constructor.name;
    logger.log(`Loaded queries: ${Object.keys(this.resolvers.Query)}`, context);

    if (this.resolvers.Mutation) {
      logger.log(`Loaded mutations: ${Object.keys(this.resolvers.Mutation)}`, context);
    }

    return this.resolvers;
  }

  public async getResolversInArray(): Promise<{queryResolvers?: string[]; mutationResolvers?: string[]}> {
    await this.loadResolvers();

    const { Query: query, Mutation: mutation } = this.resolvers;

    const queryResolvers = query ? Object.keys(query) : undefined;
    const mutationResolvers = mutation ? Object.keys(mutation) : undefined;

    return {
      queryResolvers,
      mutationResolvers,
    };
  }

  public getTypeDefs(): DocumentNode {
    return gql`${fs.readFileSync(this.schemaPath, 'utf8')}`;
  }
}
