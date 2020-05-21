import { gql } from 'apollo-boost';
import IProject from '../../../interfaces/project.interface';
import { CREATE_PROJECT, DELETE_PROJECT, LIST_PROJECTS } from './queries';

export default class Project {
  constructor(private readonly apiClient) {
  }

  private get includeServices() {
    return `services{
       id
      createdAt
      updatedAt
      name
      description
      status
      state
      repositoryUrl
      displayName
      organizationId
      private }`;
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
      query: gql` query project($id: Int!){
          project(id:$id){
              id
              name
              status
              ${includeServices ? this.includeServices : ''}
          }
      }`,

    });

    return project;
  }
}
