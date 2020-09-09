import { Command as Base } from '@oclif/command';
import ApolloClient from 'apollo-boost';
import fetch from 'cross-fetch';
import ux from 'cli-ux';
import { Connection } from 'typeorm';
import inquirer from 'inquirer';
import { yellow, blue } from 'chalk';
import { DatabaseConnector, logger } from 'codestore-utils';
import APIClient from './api-client';
import HomeFolderService from './home-folder-service';
import CommandIds from '../common/constants/commandIds';
import ServiceWorker from './service-worker';
import { BaseCodestoreError, NotAuthorizedError } from './errors';
import IService from '../interfaces/service.interface';
import IProject from '../interfaces/project.interface';
import { createPrefix } from '../common/utils';

const pjson = require('../../package.json');

export default abstract class Command extends Base {
  private homeFolderService = new HomeFolderService();

  public serviceWorker = new ServiceWorker();

  public base = `${pjson.name}@${pjson.version}`;

  private _codestore!: APIClient;

  protected gqlClient: ApolloClient<unknown>;

  public static apiPath = process.env.CODESTORE_GATEWAY_HOST || 'https://api.code.store';

  public static appPath = process.env.CODESTORE_APP_HOST || 'https://app.code.store';

  private authToken = process.env.AUTH_TOKEN;

  public get codestore(): APIClient {
    return this._codestore;
  }

  abstract execute(): PromiseLike<any>;

  // do not override this method because it uses execute method to provide base error handling logic.
  public async run(): Promise<void> {
    try {
      await this.setupApiClient(this.id === CommandIds.LOGIN || this.id === CommandIds.DEV);
      this._codestore = new APIClient(this.homeFolderService, this.gqlClient);
      await this.execute();
    } catch (e) {
      if (e?.constructor === NotAuthorizedError) {
        this.homeFolderService.removeToken().catch(logger.error);
      }

      if (e instanceof BaseCodestoreError) {
        this.log(e.message);
        return;
      }

      if (e?.constructor.name === 'RequiredArgsError') {
        this.log(e.message);
        return;
      }

      this.error(e.toString());
    }
  }

  private async setupApiClient(onLogin = false): Promise<void> {
    this.gqlClient = new ApolloClient({
      fetch,
      // does not work when uri gets from config in terminal, should be rechecked
      uri: Command.getServiceUrl({ endpoint: 'federation-gateway-service' }),
      headers: {
        Authorization: !onLogin && (this.authToken || await this.homeFolderService.getToken()),
      },
      onError: (): void => { },
    });
    this._codestore = new APIClient(this.homeFolderService, this.gqlClient);
  }

  // this method is required if we need do actions after login in one command, now it works to get token and receive user info
  protected async resetApiClient(): Promise<void> {
    await this.setupApiClient();
  }

  // eslint-disable-next-line class-methods-use-this
  protected renderTable(data: object[], schema: any, options: object = { 'no-truncate': true }): void {
    ux.table(data, schema, options);
  }

  public async getDatabaseConnection(): Promise<Connection> {
    const { localConfiguration } = await this.serviceWorker.loadValuesFromYaml();

    if (!localConfiguration) {
      throw new Error('Cannot find localConfiguration in codestore.yaml');
    }

    if (!localConfiguration || !localConfiguration.database) {
      throw new Error('There is no database configuration in codestore.yaml');
    }

    return DatabaseConnector.createConnection(localConfiguration.database);
  }

  protected async chooseService(args: { [key: string]: string }, prefix: string, inputServices?: IService[]): Promise<IService | undefined> {
    const services = inputServices || await this.codestore.Service.list();
    const { serviceArg } = args;

    if (!services.length) {
      this.log(`There are no services yet, try creating one using ${yellow('codestore service:create')} command.`);
      return undefined;
    }

    const foundService = services.find((service) => service.uniqueName === serviceArg);
    if (foundService) return foundService;

    if (serviceArg) {
      this.log(`Service with id ${blue(serviceArg)} does not exist`);
    }

    const serviceMap = new Map(services.map((s) => [
      `${s.uniqueName}\t${s.problemSolving}`,
      s,
    ]));

    const { choosedService } = await inquirer.prompt({
      type: 'list',
      name: 'choosedService',
      message: 'Service:',
      prefix: createPrefix(prefix),
      choices: Array.from(serviceMap.keys()),
    });
    return serviceMap.get(choosedService);
  }

  protected async chooseProject(args: { [key: string]: string }, prefix: string): Promise<IProject | undefined> {
    const projects = await this.codestore.Project.list();
    const { projectArg } = args;

    if (!projects.length) {
      this.log(`There are no projects yet, try creating one using ${yellow('codestore project:create')} command.`);
      return undefined;
    }

    const foundProject = projects.find((project) => project.uniqueName === projectArg);
    if (foundProject) return foundProject;

    if (projectArg) {
      this.log(`Project with id ${blue(projectArg)} does not exist`);
    }

    const projectMap = new Map(projects.map((s) => [
      `${s.uniqueName}\t${s.description}`,
      s,
    ]));

    const { choosedProject } = await inquirer.prompt({
      type: 'list',
      name: 'choosedProject',
      message: 'Project:',
      prefix: createPrefix(prefix),
      choices: Array.from(projectMap.keys()),
    });
    return projectMap.get(choosedProject);
  }

  public static getServiceUrl({ endpoint }: {endpoint: string}): string {
    if (endpoint !== 'federation-gateway-service') {
      return `${this.apiPath}/${endpoint.split('-').join('')}/graphql`;
    }
    return `${this.apiPath}/${endpoint}/graphql`;
  }
}
