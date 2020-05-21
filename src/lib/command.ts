import { Command as Base } from '@oclif/command';
import ApolloClient from 'apollo-boost';
import fetch from 'cross-fetch';
import { config } from 'node-config-ts';
import ux from 'cli-ux';
import APIClient from './api-client';
import HomeFolderService from './homeFolderService';

const pjson = require('../../package.json');

export default abstract class Command extends Base {
  private homeFolderService = new HomeFolderService();

  base = `${pjson.name}@${pjson.version}`;

  _codestore!: APIClient;

  protected gqlClient;

  get codestore(): APIClient {
    return this._codestore;
  }

  abstract execute():PromiseLike<any>;

  // do not override this method because it uses execute method to provide base erorr handling logic.
  async run() {
    try {
      this.gqlClient = new ApolloClient({
        fetch,
        uri: config.gatewayUrl,
        headers: {
          Authorization: this.id !== 'auth:login' && await this.homeFolderService.getToken(),
        },
      });
      this._codestore = new APIClient(this.homeFolderService, this.gqlClient);
      await this.execute();
    } catch (e) {
      this.error(e.message);
    }
  }

  renderTable(data: object[], schema: any) {
    ux.table(data, schema, { 'no-truncate': true });
  }
}
