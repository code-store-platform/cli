import { createConnection, Connection } from 'typeorm';
import path from 'path';
import { IDbConfig } from '../../interfaces/service-config.interface';
import paths from '../../common/constants/paths';

export default class DatabaseConnector {
  private static entitiesPath = path.join(paths.BUILD, 'data', 'entities', '*.js');

  private static migrationsPath = path.join(paths.BUILD, 'data', 'migrations');

  public static async createConnection(config: IDbConfig): Promise<Connection> {
    return createConnection({
      type: 'postgres',
      ...config,
      entities: [
        path.normalize(this.entitiesPath),
      ],
      migrations: [this.migrationsPath],
      name: 'default',
    });
  }
}
