import { Command as Base } from '@oclif/command';
import ApolloClient from 'apollo-boost';
import fetch from 'cross-fetch';
import ux from 'cli-ux';
import { yellow } from 'chalk';
import APIClient from './api-client';
import HomeFolderService from './home-folder-service';
import CommandIds from '../common/constants/commandIds';
import ServiceWorker from './service-worker';
import { WrongFolderError } from './errors';

const pjson = require('../../package.json');

export default abstract class Command extends Base {
  private homeFolderService = new HomeFolderService();

  public serviceWorker = new ServiceWorker();

  public base = `${pjson.name}@${pjson.version}`;

  private _codestore!: APIClient;

  protected gqlClient: ApolloClient<unknown>;

  protected apiPath = process.env.CODESTORE_GATEWAY_HOST || 'https://api.code.store';

  public get codestore(): APIClient {
    return this._codestore;
  }

  abstract execute(): PromiseLike<any>;

  // do not override this method because it uses execute method to provide base error handling logic.
  public async run(): Promise<void> {
    try {
      await this.setupApiClient(this.id === CommandIds.LOGIN);
      this._codestore = new APIClient(this.homeFolderService, this.gqlClient);
      await this.execute();
    } catch (e) {
      if (e?.message === 'Bad JWT token.') {
        this.log(`Seems that you're not logged in. Please execute ${yellow(' codestore login ')} command to sign-in again.`);
        return;
      }

      if (e?.constructor === WrongFolderError) {
        this.log(e.message);
        return;
      }

      if (e?.constructor.name === 'RequiredArgsError') {
        this.log(e.message);
        return;
      }

      this.error(e?.message);
    }
  }

  private async setupApiClient(onLogin = false): Promise<void> {
    this.gqlClient = new ApolloClient({
      fetch,
      // does not work when uri gets from config in terminal, should be rechecked
      uri: `${this.apiPath}/federation-gateway-service/graphql`,
      headers: {
        Authorization: !onLogin && await this.homeFolderService.getToken(),
      },
      onError: (): void => {},
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
}
