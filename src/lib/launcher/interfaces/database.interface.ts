import { Repository, Connection } from 'typeorm';

export interface IRepositories {
  [key: string]: Repository<any>;
}

export interface IConnector {
  connection: Connection;
  repositories: IRepositories;
}
