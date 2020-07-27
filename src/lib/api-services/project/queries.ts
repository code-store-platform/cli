import { gql } from 'apollo-boost';
import { PROJECT, SERVICE } from '../fields';

export const CREATE_PROJECT = gql`mutation createProject($data: InputProject!){
  createProject(data:$data){
    ${PROJECT}
  }
}`;

export const DELETE_PROJECT = gql`mutation deleteProject($id: Int!){
  deleteProject(id: $id)
}`;

export const LIST_PROJECTS = gql`query projects($pagination: PaginationOptions){
  projects(pagination:$pagination){
    author{
      email
    }
    ${PROJECT}
    services {
      id
    }
  }
}`;

export const SINGLE_PROJECT_ENV = gql` query project($id: Int!){
  project(id:$id){
    ${PROJECT}
    services {
      ${SERVICE}
    }
    environments{
      id
      name
      deployments{
        id
        status
        serviceId
        commitId
      }
    }
  }
}`;

export const SINGLE_PROJECT = gql` query project($id: Int!){
  project(id:$id){
    ${PROJECT}
  }
}`;

export const SINGLE_PROJECT_INCLUDE_SERVICES = gql` query project($id: Int!){
  project(id:$id){
    ${PROJECT}
    services {
    ${SERVICE}
    }
  }
}`;

export const PROMOTE_SERVICE_IN_PROJECT = gql`mutation promote($data: PromoteServiceInProject){
  promoteServiceInProject(input:$data){
    id
    commitId
  }
}`;
