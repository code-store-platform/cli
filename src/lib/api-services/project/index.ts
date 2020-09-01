import { gql } from 'apollo-boost';
import IProject from '../../../interfaces/project.interface';
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  DELETE_PROJECT_BY_UNIQUE_NAME,
  LIST_PROJECTS,
  SINGLE_PROJECT,
  SINGLE_PROJECT_INCLUDE_SERVICES,
  SINGLE_PROJECT_ENV,
  PROMOTE_SERVICE_IN_PROJECT,
  SINGLE_PROJECT_INCLUDE_SERVICES_BY_UNIQUE_NAME,
  SINGLE_PROJECT_BY_UNIQUE_NAME,
  SINGLE_PROJECT_ENV_BY_UNIQUE_NAME,
  PROMOTE_SERVICE_IN_PROJECT_BY_UNIQUE_NAME,
} from './queries';
import ApiService from '../base-api-service';
import ProjectServiceBillingType from '../../../common/constants/project-service-billing-type.enum';

export default class Project extends ApiService {
  public async create(data: { name: string; description: string }): Promise<IProject> {
    const { data: { createProject } } = await this.executeMutation(CREATE_PROJECT, { data });

    return createProject;
  }

  public async delete(id: number): Promise<boolean> {
    const { data } = await this.executeMutation(DELETE_PROJECT, { id });

    return data;
  }

  public async deleteByUniqueName(uniqueName: string): Promise<boolean> {
    const { data } = await this.executeMutation(DELETE_PROJECT_BY_UNIQUE_NAME, { uniqueName });

    return data;
  }

  public async list(): Promise<IProject[]> {
    const { data: { projects } } = await this.executeQuery(LIST_PROJECTS, {
      pagination: {
        page: 1,
        perPage: 100,
      },
    });

    return projects;
  }

  public async singleByUniqueName(uniqueName: string, includeServices: boolean = false): Promise<IProject> {
    const query = includeServices ? SINGLE_PROJECT_INCLUDE_SERVICES_BY_UNIQUE_NAME : SINGLE_PROJECT_BY_UNIQUE_NAME;

    const { data: { project } } = await this.executeQuery(query, { uniqueName });

    return project;
  }

  public async single(id: number, includeServices: boolean = false): Promise<IProject> {
    const query = includeServices ? SINGLE_PROJECT_INCLUDE_SERVICES : SINGLE_PROJECT;

    const { data: { project } } = await this.executeQuery(query, { id });

    return project;
  }

  public async includeServiceByUniqueName(projectUniqueName: string, serviceUniqueName: string, billingType: ProjectServiceBillingType, billingValue: string): Promise<any> {
    const mutation = gql`mutation includeServiceByUniqueNames($data: InputProjectServiceUniqueNamesWithBilling!){
      includeServiceByUniqueNames(data: $data) {
        status
      }
    }`;
    const { data: { includeServiceByUniqueNames } } = await this.executeMutation(mutation, {
      data: {
        projectUniqueName,
        serviceUniqueName,
        billingType,
        billingValue,
      },
    });

    return includeServiceByUniqueNames;
  }

  public async excludeServiceByUniqueName(projectUniqueName: string, serviceUniqueName: string): Promise<any> {
    const mutation = gql`mutation excludeServiceByUniqueNames($data: InputProjectServiceUniqueNames!) {
      excludeServiceByUniqueNames(data: $data) {
        status
      }
    }`;
    const { data: { excludeServiceByUniqueNames } } = await this.executeMutation(mutation, {
      data: {
        projectUniqueName,
        serviceUniqueName,
      },
    });

    return excludeServiceByUniqueNames;
  }

  public async singleWithEnvsByUniqueName(uniqueName: string): Promise<any> {
    const { data: { project } } = await this.executeQuery(SINGLE_PROJECT_ENV_BY_UNIQUE_NAME, { uniqueName });

    return project;
  }

  public async singleWithEnvs(projectId: number): Promise<any> {
    const { data: { project } } = await this.executeMutation(SINGLE_PROJECT_ENV, { id: projectId });

    return project;
  }

  public async promoteService(data: { projectId: number; serviceId: number; targetEnvironment: string }): Promise<any> {
    const { data: { promoteServiceInProject } } = await this.executeMutation(PROMOTE_SERVICE_IN_PROJECT, { data });

    return promoteServiceInProject;
  }

  public async promoteServiceByUniqueName(data: { projectUniqueName: string; serviceUniqueName: string; targetEnvironment: string }): Promise<any> {
    const { data: { promoteServiceInProjectByUniqueName } } = await this.executeMutation(PROMOTE_SERVICE_IN_PROJECT_BY_UNIQUE_NAME, { data });

    return promoteServiceInProjectByUniqueName;
  }
}
