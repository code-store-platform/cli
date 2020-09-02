import { ApolloClient, DocumentNode } from 'apollo-boost';
import { logger } from 'codestore-utils';
import { NotAuthorizedError } from '../errors';

export default class ApiService {
  public constructor(
    protected readonly apiClient: ApolloClient<unknown>,
  ) {}

  private errors = new Map<string, Error>([
    ['Unauthorized', new NotAuthorizedError()],
    ['Bad JWT token.', new NotAuthorizedError()],
  ]);

  private handleCustomError(message: string): Error {
    const error = this.errors.get(message);

    if (error) {
      return error;
    }

    return new Error(message);
  }

  protected async executeQuery(query: DocumentNode, variables: object | null): Promise<any> {
    try {
      return await this.apiClient.query({
        query,
        variables,
        fetchPolicy: 'no-cache',
      });
    } catch (e) {
      logger.error(e);

      if (e.graphQLErrors?.length) {
        throw this.handleCustomError(e.graphQLErrors[0]?.message);
      }

      throw this.handleCustomError(e.message);
    }
  }

  protected async executeMutation(mutation: DocumentNode, variables: any): Promise<any> {
    try {
      return await this.apiClient.mutate({
        mutation,
        variables,
      });
    } catch (e) {
      logger.error(e);

      if (e.graphQLErrors?.length) {
        throw this.handleCustomError(e.graphQLErrors[0].message);
      }

      throw this.handleCustomError(e.message);
    }
  }
}
