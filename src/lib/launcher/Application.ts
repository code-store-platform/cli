import { ApolloServer } from 'apollo-server-express';
import { logger } from 'codestore-utils';
import GraphqlLoader from './GraphQLLoader';
import DatabaseLoader from './DatabaseLoader';
import { IConfig } from './interfaces/config.interface';

export default class Application {
  private gqlLoader: GraphqlLoader = new GraphqlLoader();

  public constructor(public readonly config: IConfig) {}

  public async buildServer(): Promise<ApolloServer> {
    try {
      logger.log('Connecting to database', 'Database');

      const connection = await DatabaseLoader.createConnection(this.config.db);

      logger.log('Successfully connected', 'Database');

      await connection.runMigrations();

      logger.log('Migrations ran', 'Database');

      return new ApolloServer({
        playground: true,
        introspection: true,
        typeDefs: await this.gqlLoader.getTypeDefs(),
        resolvers: await this.gqlLoader.getResolvers(),
        uploads: false,
        context: (): object => ({
          db: {
            connection,
          },
        }),
      });
    } catch (e) {
      throw new Error(`Server failed to start, error: ${e}`);
    }
  }
}
