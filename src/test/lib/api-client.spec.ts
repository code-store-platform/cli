import APIClient from '../../lib/api-client';

describe('Api Client', () => {
  let apiClient: APIClient;

  const homeFolderServiceMocks = {
    saveToken: () => null,
    getToken: () => 'testtoken',
    removeToken: () => null,
  };

  const gqlClientMock = {
    query: (options): object => ({
      data: {
        me: {
          email: 'test@email.com',
        },
      },
    }),
  };

  beforeAll(async () => {
    apiClient = new APIClient();

    Object.assign(apiClient, {
      homeFolderService: homeFolderServiceMocks,
      graphqlClient: gqlClientMock,
    });
  });

  it('login', async () => {
    const spy = jest.spyOn(homeFolderServiceMocks, 'saveToken');

    await apiClient.login('test', 'test');

    expect(spy).toBeCalled();
  });

  it('get me', async () => {
    const spyGetToken = jest.spyOn(homeFolderServiceMocks, 'getToken');
    const spyGqlQuery = jest.spyOn(gqlClientMock, 'query');

    await apiClient.getMe();

    expect(spyGetToken).toBeCalled();
    expect(spyGqlQuery).toBeCalled();
  });

  it('logout', async () => {
    const spyRemoveToken = jest.spyOn(homeFolderServiceMocks, 'removeToken');

    await apiClient.logout();

    expect(spyRemoveToken).toBeCalled();
  });
});
