import * as queries from './queries';
import IService, { IServiceCreateResult, IServiceCreate } from '../../../interfaces/service.interface';
import ServiceStateEnum from '../../../common/constants/service-state.enum';
import ServiceStatusEnum from '../../../common/constants/service-status.enum';
import ApiService from '../base-api-service';

export default class Service extends ApiService {
  public async list(includeDeployments?: boolean): Promise<IService[]> {
    const query = includeDeployments ? queries.LIST_SERVICE_INCLUDE_DEPLOYMENTS : queries.LIST_SERVICES;

    const { data: { services } } = await this.executeQuery(query, {
      pagination: {
        page: 1,
        perPage: 100,
      },
    });

    return services;
  }

  public async create(service: IServiceCreate): Promise<IServiceCreateResult> {
    const { data: { createService } } = await this.executeMutation(queries.CREATE_SERVICE, { service: { ...service, private: true } });

    return createService;
  }

  public async businessDomains(): Promise<string[]> {
    const { data: { __type: { enumValues } } } = await this.executeQuery(queries.LIST_BUSINESS_DOMAINS, null);

    return enumValues.map((value) => value.name.replace('_', ' '));
  }

  public async delete(id: number): Promise<{ affected: number }> {
    const { data } = await this.executeMutation(queries.DELETE_SERVICE, {
      id: {
        id,
      },
    });

    return data;
  }

  public async deleteByUniqueName(uniqueName: string): Promise<{ affected: number }> {
    const { data } = await this.executeMutation(queries.DELETE_SERVICE_BY_UNIQUE_NAME, { uniqueName });

    return data;
  }

  public async download(id: number): Promise<string> {
    const result = await this.executeQuery(queries.DOWNLOAD_SERVICE, { id });

    return result.data.downloadProject.data;
  }

  public async downloadByUniqueName(uniqueName: string): Promise<string> {
    const result = await this.executeQuery(queries.DOWNLOAD_SERVICE_BY_UNIQUE_NAME, { uniqueName });

    return result.data.downloadProject.data;
  }

  public async push(encodedString: string, releaseNotes: string[], description: string): Promise<string> {
    const { data } = await this.executeMutation(queries.PUSH_SERVICE, {
      base64Service: encodedString,
      notes: releaseNotes,
      description,
    });

    return data.pushService.data;
  }

  public async getServiceByUniqueName(uniqueName: string): Promise<IService> {
    const { data: { serviceByUniqueName } } = await this.executeQuery(queries.SINGLE_SERVICE_BY_UNIQUE_NAME, { uniqueName });

    return serviceByUniqueName;
  }

  public async getService(serviceId: number, includeDeployments?: boolean): Promise<IService> {
    const query = includeDeployments ? queries.SINGLE_SERVICE_INCLUDING_DEPLOYMENTS : queries.SINGLE_SERVICE;

    const { data: { service } } = await this.executeQuery(query, { id: serviceId });

    return service;
  }

  public async checkServiceCreated(serviceId: number): Promise<boolean> {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const service = await this.getService(serviceId);
        if (service.state === ServiceStateEnum.NEW_CONTAINER_IMAGE_AVAILABLE) {
          resolve(true);
          clearInterval(interval);
        }
      }, 3000);
    });
  }

  public async checkServiceDeployed(serviceId: number): Promise<boolean> {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const service = await this.getService(serviceId);
        if (service.status === ServiceStatusEnum.ACTIVE) {
          resolve(true);
          clearInterval(interval);
        }
      }, 3000);
    });
  }

  public async generateEntities(encodedString: string): Promise<string> {
    const { data } = await this.executeMutation(queries.GENERATE_SERVICE_ENTITIES, {
      base64Service: encodedString,
    });

    return data.generateServiceEntities.data;
  }

  public async getMigrations(encodedString: string): Promise<string[]> {
    const { data } = await this.executeQuery(queries.GET_SERVICE_MIGRATIONS, {
      base64Service: encodedString,
    });

    return data.getServiceMigrations.data;
  }

  public async promoteByUniqueName(uniqueName: string): Promise<IService> {
    const { data: { promoteServiceByUniqueName } } = await this.executeMutation(queries.PROMOTE_SERVICE_BY_UNIQUE_NAME, { uniqueName });

    return promoteServiceByUniqueName;
  }

  public async promote(serviceId: number): Promise<IService> {
    const { data: { promoteService } } = await this.executeMutation(queries.PROMOTE_SERVICE, { id: serviceId });

    return promoteService;
  }

  public async isUniqueNameAvailable(displayName: string): Promise<{ uniqueName: string; free: boolean; variants: string[] }> {
    const { data: { isServiceUniqueNameAvailable } } = await this.executeQuery(queries.IS_SERVICE_UNIQUE_NAME_AVAILABLE, { displayName });

    return isServiceUniqueNameAvailable;
  }
}
