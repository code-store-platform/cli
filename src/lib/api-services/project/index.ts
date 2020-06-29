import { gql } from 'apollo-boost';
import IProject from '../../../interfaces/project.interface';
import {
  CREATE_PROJECT, DELETE_PROJECT, LIST_PROJECTS, SINGLE_PROJECT, SINGLE_PROJECT_INCLUDE_SERVICES,
} from './queries';
import ApiService from '../base-api-service';

export default class Project extends ApiService {
  public constructor(props) {
    super(props);
  }

  public async create(name: string): Promise<IProject> {
    const { data: { createProject } } = await this.executeMutation(CREATE_PROJECT, { data: { name } });

    return createProject;
  }

  public async delete(id: number): Promise<boolean> {
    const { data } = await this.executeMutation(DELETE_PROJECT, { id });

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

  public async single(id: number, includeServices: boolean = false): Promise<IProject> {
    const query = includeServices ? SINGLE_PROJECT_INCLUDE_SERVICES : SINGLE_PROJECT;

    const { data: { project } } = await this.executeQuery(query, { id });

    return project;
  }

  public async includeService(projectId: number, serviceId: number): Promise<any> {
    const mutation = gql`mutation {
      includeService(data: {
        projectId: ${projectId},
        serviceId: ${serviceId}
          }) { status }
    }`;
    return this.executeMutation(mutation, null);
  }

  public async excludeService(projectId: number, serviceId: number): Promise<any> {
    const mutation = gql`mutation {
      excludeService(data: {
        projectId: ${projectId},
        serviceId: ${serviceId}
      }) { status }
    }`;
    return this.executeMutation(mutation, null);
  }
}
