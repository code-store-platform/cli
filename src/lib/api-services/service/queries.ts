import { gql } from 'apollo-boost';
import { SERVICE, DEPLOYMENT } from '../fields';

export const LIST_SERVICES = gql`query s($pagination:PaginationOptions){
    services(pagination:$pagination, isPrivate: true){
        ${SERVICE}
    }
}`;

export const LIST_SERVICE_INCLUDE_DEPLOYMENTS = gql`query s($pagination:PaginationOptions){
  services(pagination:$pagination, isPrivate: true){
    ${SERVICE}
    deployments {
      ${DEPLOYMENT}
    }
  }
}`;

export const SINGLE_SERVICE_BY_UNIQUE_NAME = gql`query serviceByUniqueName($uniqueName: String!) {
  serviceByUniqueName(uniqueName: $uniqueName) {
    ${SERVICE}
  }
}`;

export const SINGLE_SERVICE = gql`query singleService($id: Int!){
  service(id:{
    id: $id
  }){
    ${SERVICE}
    deployments {
      ${DEPLOYMENT}
    }
  }
}`;

export const SINGLE_SERVICE_INCLUDING_DEPLOYMENTS = gql`query singleService($id: Int!){
  service(id:{
    id: $id
  }){
    ${SERVICE}
    deployments {
      ${DEPLOYMENT}
    }
  }
}`;

export const CREATE_SERVICE = gql`
    mutation createService(
        $service: CreateService!,
    ){
        createService(service:$service){
           service {
             ${SERVICE}
           }
           commitId
        }
    }`;

export const LIST_BUSINESS_DOMAINS = gql`{
    __type(name:"BusinessDomain"){
        name
        enumValues{
            name
        }
    }
}`;

export const DEPLOY_SERVICE = gql`mutation deployService($deployment: DeploymentCreate!){
    deployService(deployment:$deployment){
        ${SERVICE}
    }
}`;

export const DELETE_SERVICE_BY_UNIQUE_NAME = gql`mutation deleteServiceByUniqueName($uniqueName: String!) {
    deleteServiceByUniqueName(uniqueName:$uniqueName) { id }
}`;

export const DELETE_SERVICE = gql`mutation deleteService($id: Id!){
    deleteService(id:$id){
        affected
    }
}`;

export const DOWNLOAD_SERVICE_BY_UNIQUE_NAME = gql`query downloadProjectByUniqueName($uniqueName: String!) {
  downloadProjectByUniqueName(uniqueName: $uniqueName) {
    data
  }
}`;

export const DOWNLOAD_SERVICE = gql`query downloadProject($id: Int!){
  downloadProject(serviceId:$id){
    data
  }
}`;

export const PUSH_SERVICE = gql`mutation pushService($base64Service: String!, $notes: [String]!, $description: String!) {
  pushService(base64Service:$base64Service, releaseNotes: $notes, description: $description){
    data
  }
}`;

export const PROMOTE_SERVICE_BY_UNIQUE_NAME = gql`mutation promoteServiceByUniqueName($uniqueName: String!) {
  promoteServiceByUniqueName(uniqueName: $uniqueName) {
    ${SERVICE}
  }
}`;

export const PROMOTE_SERVICE = gql`mutation promoteService($id: Int!){
  promoteService(id: $id){
    ${SERVICE}
  }
}`;

export const GENERATE_SERVICE_ENTITIES = gql`mutation generateServiceEntities($base64Service: String!){
  generateServiceEntities(base64Service:$base64Service) {
    data
  }
}`;

export const GET_SERVICE_MIGRATIONS = gql`query getServiceMigrations($base64Service: String!){
  getServiceMigrations(base64Service:$base64Service){
    data
  }
}`;
