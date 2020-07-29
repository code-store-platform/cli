import { gql } from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
export const GET_LOGS = gql`query logs($query: LogQuery) {
  logs(query: $query) {
    time
    message
  }
}`;
