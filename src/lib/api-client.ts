import axios from 'axios';
import { EventEmitter } from 'events';
import ApolloClient, { gql } from 'apollo-boost';
import fetch from 'cross-fetch';
import config from '../config';
import { openBrowser, server, emitter } from './webAuthHelper';
import FileWorker from './fileWorker';

export default class APIClient {
  private endpoint = config.authApiUrl;

  private homeFolderService = new FileWorker();

  private client = new ApolloClient({
    fetch,
    uri: config.gatewayUrl,
    headers: {
      'x-user-permissions': '{"userId": 1,"role": "Admin"}',
    },
  });

  async login(email: string, password:string):Promise<void> {
    const { data: token } = await axios.post(`${this.endpoint}/authorize`, { email, password });
    this.homeFolderService.saveToken(token);
  }

  async getMe():Promise<{email:string}> {
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

  async logout() {
    this.homeFolderService.removeToken();
  }
}
