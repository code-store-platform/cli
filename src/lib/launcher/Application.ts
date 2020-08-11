import { ApolloServer } from 'apollo-server-express';
import GraphqlLoader from './GraphQLLoader';
import DatabaseLoader from './DatabaseLoader';
import { IConfig } from './interfaces/config.interface';

export default class Application {
  private gqlLoader: GraphqlLoader = new GraphqlLoader();

  private dbLoader: DatabaseLoader;

  public constructor(public readonly config: IConfig) {
    this.dbLoader = new DatabaseLoader(config);
  }

  public async buildServer(): Promise<ApolloServer> {
    try {
      const { connection, repositories }: any = await this.dbLoader.getDbConnector();

      return new ApolloServer({
        playground: true,
        introspection: true,
        typeDefs: await this.gqlLoader.getTypeDefs(),
        resolvers: await this.gqlLoader.getResolvers(),
        uploads: false,
        context: (): object => ({
          db: {
            connection,
            repositories,
          },
        }),
      });
    } catch (e) {
      throw new Error(`Server failed to start, error: ${e}`);
    }
  }
}
