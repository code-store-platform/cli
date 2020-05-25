import Service from '../../../lib/api-services/service';
import { IServiceCreate } from '../../../interfaces/service.interface';

describe('Service Api Service', () => {
  let service: Service;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockFn = (args): any => ({});

  const gqlClientMock = {
    query: mockFn,
    mutate: mockFn,
  };

  beforeAll(async () => {
    service = new Service(gqlClientMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queries', () => {
    it('list', async () => {
      const spy = jest.spyOn(gqlClientMock, 'query').mockImplementation(async () => ({
        data: {
          services: [],
        },
      }));

      const data = await service.list();

      expect(spy.mock.calls[0][0]).toMatchObject({
        variables: {
          pagination: {
            page: 1,
            perPage: 100,
          },
        },
      });
      expect(data).toHaveLength(0);
    });

    it('businessDomains', async () => {
      jest.spyOn(gqlClientMock, 'query').mockImplementation(async () => ({
        data: {
          __type: {
            enumValues: ['CRM'],
          },
        },
      }));

      const data = await service.businessDomains();

      expect(data).toHaveLength(1);
    });
  });

  describe('mutations', () => {
    it('create', async () => {
      const serviceExample: IServiceCreate = {
        businessDomain: 'CRM',
        howSolving: 'TEST',
        name: 'TEST',
        private: false,
        problemSolving: 'TEST',
        tags: 'test, test2',
      };

      const spy = jest.spyOn(gqlClientMock, 'mutate').mockImplementation(async () => ({
        data: {
          createService: {},
        },
      }));

      await service.create(serviceExample);

      expect(spy.mock.calls[0][0]).toMatchObject({
        variables: {
          service: serviceExample,
        },
      });
    });

    it('deploy', async () => {
      const spy = jest.spyOn(gqlClientMock, 'mutate').mockImplementation(async () => ({
        data: {
          deployService: {},
        },
      }));

      await service.deploy(1, 'test');

      expect(spy.mock.calls[0][0]).toMatchObject({
        variables: {
          deployment: {
            serviceId: 1,
            commitId: 'test',
            projectId: 0,
          },
        },
      });
    });

    it('delete', async () => {
      const spy = jest.spyOn(gqlClientMock, 'mutate').mockImplementation(async () => ({
        data: true,
      }));

      await service.delete(1);

      expect(spy.mock.calls[0][0]).toMatchObject({
        variables: {
          id: {
            id: 1,
          },
        },
      });
    });
  });
});
