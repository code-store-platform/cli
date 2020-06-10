import { ApolloClient } from 'apollo-boost';
import {
  LIST_SERVICES, CREATE_SERVICE, DEPLOY_SERVICE, LIST_BUSINESS_DOMAINS, DELETE_SERVICE, DOWNLOAD_SERVICE, PUSH_SERVICE,
} from './queries';
import { IService, IServiceCreateResult, IServiceCreate } from '../../../interfaces/service.interface';

export default class Service {
  public constructor(
    private readonly apiClient: ApolloClient<unknown>,
  ) { }

  public async list(): Promise<IService[]> {
    const { data: { services } } = await this.apiClient.query({
      query: LIST_SERVICES,
      variables: {
        pagination: {
          page: 1,
          perPage: 100,
        },
      },
    });

    return services;
  }

  public async create(service: IServiceCreate): Promise<IServiceCreateResult> {
    const { data: { createService } } = await this.apiClient.mutate({
      mutation: CREATE_SERVICE,
      variables: { service },
    });

    return createService;
  }

  public async businessDomains(): Promise<string[]> {
    const { data: { __type: { enumValues } } } = await this.apiClient.query({
      query: LIST_BUSINESS_DOMAINS,
    });

    return enumValues.map((value) => value.name);
  }

  public async deploy(serviceId: number, commitId: string, projectId: number = 0): Promise<IService> {
    const { data: { deployService } } = await this.apiClient.mutate({
      mutation: DEPLOY_SERVICE,
      variables: {
        deployment: {
          serviceId,
          commitId,
          projectId,
        },
      },
    });
    return deployService;
  }

  public async delete(id: number): Promise<{ affected: number }> {
    const { data } = await this.apiClient.mutate({
      mutation: DELETE_SERVICE,
      variables: {
        id: {
          id,
        },
      },
    });

    return data;
  }

  public async download(id: number): Promise<string> {
    const { data: { downloadProject } } = await this.apiClient.query({
      query: DOWNLOAD_SERVICE,
      variables: {
        id,
      },
    });

    return downloadProject;
  }

  public async push(encodedString: string): Promise<boolean> {
    const { data: { pushService } } = await this.apiClient.mutate({
      mutation: PUSH_SERVICE,
      variables: {
        base64Service: encodedString,
      },
    });

    return pushService;
  }
}
