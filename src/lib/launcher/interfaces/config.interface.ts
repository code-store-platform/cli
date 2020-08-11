export interface IConfig {
  port?: number;
  db: IDbConfig;
}

export interface IDbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}
