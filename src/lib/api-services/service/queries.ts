import { gql } from 'apollo-boost';
import { SERVICE } from '../fields';

export const LIST_SERVICES = gql`query s($pagination:PaginationOptions){
    services(pagination:$pagination){
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
  downloadProject(serviceId:$id)
}`;

export const PUSH_SERVICE = gql`mutation pushService($base64Service: String!, $notes: [String]!){
  pushService(base64Service:$base64Service, releaseNotes: $notes)
}`;
