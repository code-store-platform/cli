import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'List services in your organization';

  public static aliases = [Aliases.SERVICE_LS];

  public async execute(): Promise<void> {
    const services = await this.codestore.Service.list()
      .then((serviceList) => serviceList.map((service) => {
        const {
          name,
          id,
          status,
        } = service;

        return {
          id,
          name,
          // todo update when resolvers for deployments is ready
          private: ` ${this.apiPath}/0/private/${id}/graphql`,
          demo: ` ${this.apiPath}/0/demo/${id}/graphql`,
          status,
        };
      }));

    if (!services.length) {
      this.log('You don\'t have any services yet. Try creating one by running `codestore service:create`.');
      return;
    }

    this.renderTable(services, {
      id: {
        header: 'Service ID',
      },
      private: {},
      status: {},
      demo: {},
    });
  }
}
