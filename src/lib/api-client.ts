import { ApolloClient, gql } from 'apollo-boost';
import IUser from '../interfaces/user.interface';
import { openBrowser, server, emitter } from './webAuthHelper';
import HomeFolderService from './home-folder-service';
import Service from './api-services/service';
import Deployment from './api-services/deployment';
import Project from './api-services/project';
import Logs from './api-services/logs';

export default class APIClient {
  public readonly Service: Service;

  public readonly Deployment: Deployment;

  public readonly Project: Project;

  public readonly Logs: Logs;

  public constructor(private readonly homeFolderService: HomeFolderService, private readonly graphqlClient: ApolloClient<unknown>) {
    this.Service = new Service(this.graphqlClient);
    this.Deployment = new Deployment(this.graphqlClient);
    this.Project = new Project(this.graphqlClient);
    this.Logs = new Logs(this.graphqlClient);
  }

  public async getMe(): Promise<IUser> {
    const { data: { me } } = await this.graphqlClient.query({
      query: gql`{
          me {
            email
            id
            firstName
            lastName
            organization {
              name
            }
          }
      }`,
    });
    if (me) {
      return me;
    }
    throw new Error('User not defined');
  }

  public async loginWeb(): Promise<any> {
    await this.homeFolderService.removeToken();

    // opening browser. See openBrowser.ts for change configurations
    await openBrowser();
    return new Promise((resolve, reject) => {
      // launching local server to get redirect from authentication service.
      server.listen(10999);

      // waiting for auth event was emitted to set token/show error and close server
      emitter.on('auth', (result) => {
        const { success, token, error } = result;

        if (success) {
          this.homeFolderService.saveToken(token)
            .then(() => server.close(() => resolve()))
            .catch((e) => server.close(() => reject(e)));
        } else {
          server.close(() => reject(error));
        }
      });
    });
  }

  public async logout(): Promise<void> {
    return this.homeFolderService.removeToken();
  }
}
