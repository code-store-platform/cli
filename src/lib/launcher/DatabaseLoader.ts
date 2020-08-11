import fs from 'fs';
import { createConnection, Connection } from 'typeorm';
import path from 'path';
import { logger } from 'codestore-utils';
import { IRepositories, IConnector } from './interfaces/database.interface';
import { IConfig } from './interfaces/config.interface';

export default class DatabaseConnector {
  private entitiesPath = path.join(process.cwd(), 'src', 'data', 'entities', '*.ts');

  private migrationsPath = path.join(process.cwd(), 'src', 'data', 'migrations', '*.ts');

  public constructor(private readonly config: IConfig) {
  }

  public async getDbConnector(): Promise<IConnector> {
    const connection = await this.createConnection();
    const repositories = await this.loadModels(connection);

    const context = this.constructor.name;
    logger.log(`Loaded entities: ${Object.keys(repositories)}`, context);

    return {
      connection,
      repositories,
    };
  }

  private async createConnection(): Promise<Connection> {
    const context = this.constructor.name;

    logger.log('Connecting to database', context);

    const connection = await createConnection({
      type: 'postgres',
      ...this.config.db,
      entities: [
        path.normalize(this.entitiesPath),
      ],
      migrations: [this.migrationsPath],
      name: 'default',
    });

    logger.log(`Successfully connected to database ${this.config.db.database}`, context);

    logger.log('Running migrations', context);
    try {
      await connection.runMigrations();
    } catch (e) {
      await connection.undoLastMigration();
      await connection.runMigrations();
    }

    return connection;
  }

  private async loadModels(connection: Connection): Promise<IRepositories> {
    let modelFiles;
    try {
      modelFiles = fs.readdirSync(path.join(process.cwd(), 'src', 'data', 'entities'))
        .filter((file) => /.ts$/.test(file))
        .map(async (modelFile) => import(`${path.join(process.cwd(), 'src', 'data', 'entities')}/${modelFile}`));
    } catch (e) {
      if (e?.code !== 'ENOENT') {
        logger.error(e, undefined, this.constructor.name);
      }
      return {};
    }

    const loadedEntities = await Promise.all(modelFiles) as any[];

    return loadedEntities.reduce((prev, next) => {
      const value: any = Object.values(next)[0];
      const { name } = value;

      return {
        ...prev,
        [name]: connection.getRepository(value),
      };
    }, {});
  }
}
