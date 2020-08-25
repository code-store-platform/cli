import { gql } from 'apollo-boost';
import { DEPLOYMENT, DEPLOYMENT_WITH_ENVIRONMENT_NAME } from '../fields';

export const GET_DEPLOYMENT = gql`query deploymentByServiceAndEnvironment($serviceId: Int!, $environmentName: EnvironmentName){
  deploymentByServiceAndEnvironment(serviceId: $serviceId,environmentName: $environmentName ) {
    ${DEPLOYMENT}
  }
}`;

export const GET_DEPLOYMENTS_FOR_SERVICE = gql`query deploymentsForService($serviceId: Int!){
  deploymentsForService(serviceId: $serviceId) {
    ${DEPLOYMENT_WITH_ENVIRONMENT_NAME}
  }
}`;

export const GET_DEPLOYMENTS_FOR_SERVICES = gql`query deploymentsForServices($serviceIds: [Int!]!){
  deploymentsForServices(serviceIds: $serviceIds) {
    ${DEPLOYMENT_WITH_ENVIRONMENT_NAME}
  }
}`;

export const GET_DEPLOYMENTS_FOR_PROJECT_SERVICE = gql`query deploymentsForProjectService($projectId: Int!, $serviceId: Int!){
  deploymentsForProjectService(projectId: $projectId, serviceId: $serviceId) {
    ${DEPLOYMENT_WITH_ENVIRONMENT_NAME}
  }
}`;
