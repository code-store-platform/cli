import { EventEmitter } from 'events';
import ApolloClient, { gql } from 'apollo-boost';
import fetch from 'cross-fetch';
// @ts-ignore
import { config } from 'node-config-ts';
import IUser from '../interfaces/user.interface';
import { openBrowser, server, emitter } from './webAuthHelper';
import HomeFolderService from './homeFolderService';

export default class APIClient {
  private homeFolderService = new HomeFolderService();

  private client = new ApolloClient({
    fetch,
    uri: config.gatewayUrl,
    // TODO replace header with token when gateway is ready.
    headers: {
      'x-user-permissions': '{"userId": 1,"role": "Admin"}',
    },
  });

  // added for test to not using web auth, will be disabled
  async login(email: string, password: string): Promise<void> {
    return this.homeFolderService.saveToken('TOKEN');
  }

  async getMe(): Promise<IUser> {
    const token = await this.homeFolderService.getToken();
    const { data: { me } } = await this.client.query({
      query: gql`{
          me{
              email
              id
          }
      }`,
    });
    if (me) {
      return me;
    }
    throw new Error('User not defined');
  }

  async loginWeb(): Promise<EventEmitter> {
    // opening browser. See openBrowser.ts for change configurations
    await openBrowser();
    return new Promise((resolve, reject) => {
      // launching local server to get redirect from authentication service.
      server.listen(10999);

      // waiting for auth event was emitted to set token/show error and close server
      emitter.on('auth', (result) => {
        const { success, token, error } = result;

        if (success) {
          this.homeFolderService.saveToken(token);
        }

        server.close(() => {
          if (success) {
            resolve();
          } else {
            reject(error);
          }
        });
      });
    });
  }

  async logout(): Promise<void> {
    return this.homeFolderService.removeToken();
  }
}
