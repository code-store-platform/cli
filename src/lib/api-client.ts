import { gql } from 'apollo-boost';
import IUser from '../interfaces/user.interface';
import { openBrowser, server, emitter } from './webAuthHelper';
import HomeFolderService from './homeFolderService';
import Service from './api-services/service';
import Project from './api-services/project';

export default class APIClient {
  public readonly Service: Service;

  public readonly Project: Project;

  constructor(private readonly homeFolderService: HomeFolderService, private readonly graphqlClient) {
    this.Service = new Service(this.graphqlClient);
    this.Project = new Project(this.graphqlClient);
  }

  public async getMe(): Promise<IUser> {
    const { data: { me } } = await this.graphqlClient.query({
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

  public async loginWeb(): Promise<any> {
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

  public async logout(): Promise<void> {
    return this.homeFolderService.removeToken();
  }
}
