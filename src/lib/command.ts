import { Command as Base } from '@oclif/command';
import ApolloClient from 'apollo-boost';
import fetch from 'cross-fetch';
import ux from 'cli-ux';
import APIClient from './api-client';
import HomeFolderService from './homeFolderService';
import CommandIds from '../common/constants/commandIds';
import ServiceWorker from './service-worker';

const pjson = require('../../package.json');

export default abstract class Command extends Base {
  private homeFolderService = new HomeFolderService();

  protected serviceWorker = new ServiceWorker();

  public base = `${pjson.name}@${pjson.version}`;

  private _codestore!: APIClient;

  protected gqlClient;

  public get codestore(): APIClient {
    return this._codestore;
  }

  abstract execute(): PromiseLike<any>;

  // do not override this method because it uses execute method to provide base erorr handling logic.
  public async run() {
    try {
      this.gqlClient = new ApolloClient({
        fetch,
        // does not work when uri gets from config in terminal, should be rechecked
        uri: 'http://192.168.1.50:3000/api/federation-gateway-service/graphql',
        headers: {
          Authorization: this.id !== CommandIds.LOGIN && await this.homeFolderService.getToken(),
        },
      });
      this._codestore = new APIClient(this.homeFolderService, this.gqlClient);
      await this.execute();
    } catch (e) {
      this.error(e.message);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected renderTable(data: object[], schema: any) {
    ux.table(data, schema, { 'no-truncate': true });
  }
}
