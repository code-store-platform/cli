interface IDbConfig {
  port: number;
  username: string;
  password: string;
  host: string;
  database: string;
}

interface IApplicationConfig {
  port: number;
}

export default interface IServiceConfig {
  serviceId: number;
  localConfiguration: {
    database: IDbConfig;
    application: IApplicationConfig;
  };
}
