import { ApolloClient, DocumentNode } from 'apollo-boost';
import Logger from '../logger';

export default class ApiService {
  public constructor(
    protected readonly apiClient: ApolloClient<unknown>,
  ) {}

  private errors = new Map([
    ['Unauthorized', 'Live long and prosper, friend 🖖. Seems that you\'re not logged in. Please execute cs auth:login command to sign-in again.'],
  ]);

  private handleCustomError(message: string): Error {
    const error = this.errors.get(message);

    if (error) {
      return new Error(error);
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
      Logger.error(e?.networkError?.result?.errors || e);

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
      Logger.error(e?.networkError?.result?.errors || e);

      if (e.graphQLErrors?.length) {
        throw this.handleCustomError(e.graphQLErrors[0].message);
      }

      throw this.handleCustomError(e.message);
    }
  }
}
