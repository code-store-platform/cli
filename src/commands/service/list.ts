import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  static description = 'List your services';

  static aliases = [Aliases.SERVICE_LS];

  async execute() {
    const services = await this.codestore.Service.list()
      .then((serviceList) => serviceList.map((service) => {
        const { id, name } = service;
        return {
          id,
          name,
          // todo update when resolvers for deployments is ready
          develop: 'DEPLOYED',
          demo: 'DEPLOYMENT_IN_PROGRESS',
        };
      }));

    this.renderTable(services, {
      id: {
        header: 'Service ID',
      },
      name: {},
      develop: {},
      demo: {},
    });
  }
}
