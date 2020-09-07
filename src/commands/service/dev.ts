import {
  logger, compile, PathsResolverTool, GraphqlValidatorTool, bootstrap,
} from 'codestore-utils';
import Command from '../../lib/command';
import { installDependencies } from '../../lib/child-cli';

export default class Dev extends Command {
  public static description = 'Launch your service locally';

  public static aliases = ['dev'];

  public async execute(): Promise<void> {
    const { localConfiguration } = await this.serviceWorker.loadValuesFromYaml();

    if (!localConfiguration) {
      throw new Error('Cannot find localConfiguration in codestore.yaml');
    }

    if (!localConfiguration || !localConfiguration.database) {
      throw new Error('There is no database configuration in codestore.yaml');
    }

    logger.log('Installing dependencies', 'NPM');
    await installDependencies();

    logger.log('Compiling typescript code', 'TypeScript');
    await compile(await PathsResolverTool.loadFilesToCompile());
    logger.log('Validating schema', 'GraphQL');
    await GraphqlValidatorTool.validateSchema();
    logger.log('Validating queries and mutations', 'GraphQL');
    await GraphqlValidatorTool.validateQueriesAndMutations();

    const { database, application } = localConfiguration;

    logger.log('Starting development server', 'INFO');

    await bootstrap({
      db: database,
      port: application.port,
      playgroundUrl: `http://localhost:${application.port || 3000}/graphql`,
    });
  }
}
