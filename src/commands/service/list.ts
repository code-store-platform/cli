import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'List your services';

  public static aliases = [Aliases.SERVICE_LS];

  public async execute(): Promise<void> {
    const services = await this.codestore.Service.list()
      .then((serviceList) => serviceList.map((service) => {
        const { id, name } = service;
        return {
          id,
          name,
          // todo update when resolvers for deployments is ready
          private: ` ${this.apiPath}/0/private/${id}/graphql`,
          demo: ` ${this.apiPath}/0/demo/${id}/graphql`,
        };
      }));

    this.renderTable(services, {
      id: {
        header: 'Service ID',
      },
      name: {},
      private: {},
      demo: {},
    });
  }
}
