import {
  LIST_SERVICES, CREATE_SERVICE, DEPLOY_SERVICE, LIST_BUSINESS_DOMAINS, DELETE_SERVICE,
} from './queries';
import { IService, IServiceCreateResult, IServiceCreate } from '../../../interfaces/service.interface';


export default class Service {
  constructor(private readonly apiClient) {
  }

  public async list(page: number): Promise<IService[]> {
    const { data: { services } } = await this.apiClient.query({
      query: LIST_SERVICES,
      variables: {
        pagination: {
          page,
          perPage: 5,
        },
      },
    });

    return services;
  }

  public async create(service: IServiceCreate): Promise<IServiceCreateResult> {
    const { data: { createService } } = await this.apiClient.mutate({
      mutation: CREATE_SERVICE,
      variables: {
        ...service,
      },
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

  public async delete(id: number): Promise<{affected: number}> {
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
}
