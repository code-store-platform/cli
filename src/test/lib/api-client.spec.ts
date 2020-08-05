import { ApolloClient } from 'apollo-boost';
import APIClient from '../../lib/api-client';
import HomeFolderService from '../../lib/home-folder-service';

describe('Api Client', () => {
  let apiClient: APIClient;

  const homeFolderServiceMocks = {
    saveToken: (): void | null => null,
    getToken: (): string => 'testtoken',
    removeToken: (): void | null => null,
  };

  const gqlClientMock = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: (params): object => ({
      data: {
        me: {
          email: 'test@email.com',
        },
      },
    }),
  } as ApolloClient<any>;

  beforeAll(async () => {
    const homeFolderService = new HomeFolderService();
    apiClient = new APIClient(homeFolderService, gqlClientMock);

    Object.assign(apiClient, {
      homeFolderService: homeFolderServiceMocks,
      graphqlClient: gqlClientMock,
    });
  });

  it('get me', async () => {
    const spyGqlQuery = jest.spyOn(gqlClientMock, 'query');

    await apiClient.getMe();

    expect(spyGqlQuery).toBeCalled();
  });

  it('logout', async () => {
    const spyRemoveToken = jest.spyOn(homeFolderServiceMocks, 'removeToken');

    await apiClient.logout();

    expect(spyRemoveToken).toBeCalled();
  });
});
