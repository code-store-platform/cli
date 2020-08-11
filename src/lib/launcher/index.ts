import { logger } from 'codestore-utils';
import Application from './Application';
import { IConfig } from './interfaces/config.interface';

import express = require('express');

const bootstrap = async (config: IConfig): Promise<void> => {
  try {
    logger.log('Start bootstrapping the application', 'bootstrap');

    const csApp = new Application(config);
    const server = await csApp.buildServer();
    const { port } = config;

    const expressApp = express();
    expressApp.use('/health', (req, res, next) => res.json());

    server.applyMiddleware({ app: expressApp });

    // todo deny permissions on queries to migrations table
    // todo deny permissions on create, drop, alter table operations

    expressApp.listen({ port }, () => {
      logger.log(`Server is running on http://localhost:${port}`, 'bootstrap');
      logger.log(`Graphql is available on http://localhost:${port}/graphql`, 'bootstrap');
    });
  } catch (error) {
    logger.error(error, error.stack, 'bootstrap', config);
    process.exit(0);
  }
};

export {
  Application,
  bootstrap,
};
