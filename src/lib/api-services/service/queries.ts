import { gql } from 'apollo-boost';

export const LIST_SERVICES = gql`query s($pagination:PaginationOptions){
    services(pagination:$pagination){
        id
        createdAt
        updatedAt
        name
        status
        state
        repositoryUrl
        displayName
        organizationId
        private
    }
}`;

export const CREATE_SERVICE = gql`
    mutation createService(
        $service: CreateService!,
    ){
        createService(service:$service){
            id
            createdAt
            updatedAt
            name
            status
            state
            repositoryUrl
            displayName
            organizationId
            private
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
        id
        createdAt
        updatedAt
        name
        status
        state
        repositoryUrl
        displayName
        organizationId
        private
    }
}`;

export const DELETE_SERVICE = gql`mutation deleteService($id: Id!){
    deleteService(id:$id){
        affected
    }
}`;

export const DOWNLOAD_SERVICE = gql`query downloadProject($id: Int!){
  downloadProject(serviceId:$id)
}`
