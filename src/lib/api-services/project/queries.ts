import { gql } from 'apollo-boost';

export const CREATE_PROJECT = gql`mutation ($data: InputProject!){
    createProject(data:$data){
        id
        name
        status
    }
}`;

export const DELETE_PROJECT = gql`mutation deleteProject($id: Int!){
    deleteProject(id: $id)
}`;

export const LIST_PROJECTS = gql`query projects($pagination: PaginationOptions){
    projects(pagination:$pagination){
        id
        name
        status
    }
}`;

export const SINGLE_PROJECT = gql` query project($id: Int!){
  project(id:$id){
    id
    name
    status
  }
}`;

export const SINGLE_PROJECT_INCLUDE_SERVICES = gql` query project($id: Int!){
  project(id:$id){
    id
    name
    status
    services {
      id
      createdAt
      updatedAt
      name
      status
      state
      repositoryUrl
      displayName
      organizationId
      private }
  }
}`;
