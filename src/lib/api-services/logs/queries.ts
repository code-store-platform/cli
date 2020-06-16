import { gql } from 'apollo-boost';

export const GET_LOGS =
  gql`query logs($query: LogQuery) {
        logs(query: $query) {
          time
          message
        }
      }`;
