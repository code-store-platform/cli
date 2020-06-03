import IProject from '../../../interfaces/project.interface';
import {
  CREATE_PROJECT, DELETE_PROJECT, LIST_PROJECTS, SINGLE_PROJECT, SINGLE_PROJECT_INCLUDE_SERVICES,
} from './queries';

export default class Project {
  public constructor(private readonly apiClient) {
  }

  public async create(name: string): Promise<IProject> {
    const { data: { createProject } } = await this.apiClient.mutate({
      mutation: CREATE_PROJECT,
      variables: { data: { name } },
    });

    return createProject;
  }

  public async delete(id: number): Promise<boolean> {
    const { data } = this.apiClient.mutate({
      mutation: DELETE_PROJECT,
      variables: {
        id,
      },
    });

    return data;
  }

  public async list(): Promise<IProject[]> {
    const { data: { projects } } = await this.apiClient.query({
      query: LIST_PROJECTS,
      variables: {
        pagination: {
          page: 1,
          perPage: 100,
        },
      },
    });

    return projects;
  }

  public async single(id: number, includeServices: boolean = false): Promise<IProject> {
    const { data: { project } } = await this.apiClient.query({
      variables: {
        id,
      },
      query: includeServices ? SINGLE_PROJECT_INCLUDE_SERVICES : SINGLE_PROJECT,
    });

    return project;
  }
}
