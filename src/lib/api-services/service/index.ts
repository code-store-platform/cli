import {
  LIST_SERVICES,
  CREATE_SERVICE,
  LIST_BUSINESS_DOMAINS,
  DELETE_SERVICE,
  DOWNLOAD_SERVICE,
  PUSH_SERVICE,
  SINGLE_SERVICE,
  GENERATE_SERVICE_ENTITIES,
  PROMOTE_SERVICE,
  GET_SERVICE_MIGRATIONS,
} from './queries';
import { IService, IServiceCreateResult, IServiceCreate } from '../../../interfaces/service.interface';
import ServiceStateEnum from '../../../common/constants/service-state.enum';
import ApiService from '../base-api-service';

export default class Service extends ApiService {
  public constructor(args) {
    super(args);
  }

  public async list(): Promise<IService[]> {
    const { data: { services } } = await this.executeQuery(LIST_SERVICES, {
      pagination: {
        page: 1,
        perPage: 100,
      },
    });

    return services;
  }

  public async create(service: IServiceCreate): Promise<IServiceCreateResult> {
    const { data: { createService } } = await this.executeMutation(CREATE_SERVICE, { service: { ...service, private: true } });

    return createService;
  }

  public async businessDomains(): Promise<string[]> {
    const { data: { __type: { enumValues } } } = await this.executeQuery(LIST_BUSINESS_DOMAINS, null);

    return enumValues.map((value) => value.name);
  }

  public async delete(id: number): Promise<{ affected: number }> {
    const { data } = await this.executeMutation(DELETE_SERVICE, {
      id: {
        id,
      },
    });

    return data;
  }

  public async download(id: number): Promise<string> {
    const result = await this.executeQuery(DOWNLOAD_SERVICE, { id });

    return result.data.downloadProject.data;
  }

  public async push(encodedString: string, releaseNotes: string[]): Promise<string> {
    const { data } = await this.executeMutation(PUSH_SERVICE, {
      base64Service: encodedString,
      notes: releaseNotes,
    });

    return data.pushService.data;
  }

  public async getService(serviceId: number): Promise<IService> {
    const { data: { service } } = await this.executeQuery(SINGLE_SERVICE, { id: serviceId });

    return service;
  }

  public async checkServiceDeployed(serviceId: number): Promise<boolean> {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const service = await this.getService(serviceId);
        if (service.state === ServiceStateEnum.NEW_CONTAINER_IMAGE_AVAILABLE) {
          resolve(true);
          clearInterval(interval);
        }
      }, 5000);
    });
  }

  public async generateEntities(encodedString: string): Promise<string> {
    const { data } = await this.executeMutation(GENERATE_SERVICE_ENTITIES, {
      base64Service: encodedString,
    });

    return data.generateServiceEntities.data;
  }

  public async getMigrations(encodedString: string): Promise<string[]> {
    const { data } = await this.executeQuery(GET_SERVICE_MIGRATIONS, {
      base64Service: encodedString,
    });

    return data.getServiceMigrations.data;
  }

  public async promote(serviceId: number): Promise<IService> {
    const { data: { promote } } = await this.executeMutation(PROMOTE_SERVICE, { id: serviceId });

    return promote;
  }
}
