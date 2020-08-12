import { createConnection, Connection } from 'typeorm';
import path from 'path';
import { logger } from 'codestore-utils';
import { IDbConfig } from '../../interfaces/service-config.interface';

export default class DatabaseConnector {
  private entitiesPath = path.join(process.cwd(), 'src', 'data', 'entities', '*.ts');

  private migrationsPath = path.join(process.cwd(), 'src', 'data', 'migrations', '*.ts');

  public constructor(private readonly config: IDbConfig) {
  }

  public async getDbConnection(): Promise<Connection> {
    return this.createConnection();
  }

  private async createConnection(): Promise<Connection> {
    const context = this.constructor.name;

    logger.log('Connecting to database', context);

    const connection = await createConnection({
      type: 'postgres',
      ...this.config,
      entities: [
        path.normalize(this.entitiesPath),
      ],
      migrations: [this.migrationsPath],
      name: 'default',
    });

    logger.log(`Successfully connected to database ${this.config.database}`, context);

    return connection;
  }
}
