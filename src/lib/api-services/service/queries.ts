import { gql } from 'apollo-boost';
import { SERVICE } from '../fields';

export const LIST_SERVICES = gql`query s($pagination:PaginationOptions){
    services(pagination:$pagination, isPrivate: true){
        ${SERVICE}
    }
}`;

export const SINGLE_SERVICE = gql`query singleService($id: Int!){
  service(id:{
    id: $id
  }){
    ${SERVICE}
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

export const DELETE_SERVICE = gql`mutation deleteService($id: Id!){
    deleteService(id:$id){
        affected
    }
}`;

export const DOWNLOAD_SERVICE = gql`query downloadProject($id: Int!){
  downloadProject(serviceId:$id){
    data
  }
}`;

export const PUSH_SERVICE = gql`mutation pushService($base64Service: String!, $notes: [String]!){
  pushService(base64Service:$base64Service, releaseNotes: $notes){
    success
  }
}`;

export const PROMOTE_SERVICE = gql`mutation promoteService($id: Int!){
  promoteService(id: $id){
    ${SERVICE}
  }
}`;

export const GENERATE_SERVICE_ENTITIES = gql`mutation generateServiceEntities($base64Service: String!){
  generateServiceEntities(base64Service:$base64Service){
    data
  }
}`;
