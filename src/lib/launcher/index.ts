import { logger } from 'codestore-utils';
import Application from './Application';
import { IConfig } from './interfaces/config.interface';

import express = require('express');

const bootstrap = async (config: IConfig): Promise<void> => {
  try {
    logger.log('Start bootstrapping the application', 'Bootstrap');

    const csApp = new Application(config);
    const server = await csApp.buildServer();
    const { port } = config;

    const expressApp = express();
    server.applyMiddleware({ app: expressApp });

    expressApp.listen({ port }, () => {
      logger.log(`Graphql is available on: http://localhost:${port}/graphql`, 'Bootstrap');
    });
  } catch (error) {
    logger.error(error, error.stack, 'Bootstrap', config);
    process.exit(0);
  }
};

export {
  Application,
  bootstrap,
};
