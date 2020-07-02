import { ApolloClient, DocumentNode } from 'apollo-boost';

export default class ApiService {
  public constructor(
    protected readonly apiClient: ApolloClient<unknown>,
  ) {}

  private errors = new Map([
    ['Unauthorized', 'Live long and prosper, friend 🖖. Seems that you\'re not logged in. Please execute cs auth:login command to sign-in again.'],
  ]);

  private handleCustomError(message): Error {
    const error = this.errors.get(message);
    if (error) {
      return new Error(error);
    }
    return new Error(message);
  }

  protected async executeQuery(query: DocumentNode, variables: object): Promise<any> {
    try {
      return await this.apiClient.query({
        query,
        variables,
        fetchPolicy: 'no-cache',
      });
    } catch (e) {
      console.log(e);
      if (e.graphQLErrors) {
        throw this.handleCustomError(e.graphQLErrors[0].message);
      }

      throw this.handleCustomError(e);
    }
  }

  protected async executeMutation(mutation, variables): Promise<any> {
    try {
      return await this.apiClient.mutate({
        mutation,
        variables,
      });
    } catch (e) {
      console.log(e);
      if (e.graphQLErrors) {
        throw this.handleCustomError(e.graphQLErrors[0].message);
      }

      throw this.handleCustomError(e);
    }
  }
}
