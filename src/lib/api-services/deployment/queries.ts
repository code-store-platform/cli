import { gql } from 'apollo-boost';
import { DEPLOYMENT } from '../fields';

// eslint-disable-next-line import/prefer-default-export
export const GET_DEPLOYMENT = gql`query deploymentByServiceAndEnvironment($serviceId: Int!, $environmentName: EnvironmentName){
  deploymentByServiceAndEnvironment(serviceId: $serviceId,environmentName: $environmentName ) {
    ${DEPLOYMENT}
  }
}`;
