import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'List services in your organization';

  public static aliases = [Aliases.SERVICE_LS];

  public async execute(): Promise<void> {
    const services = await this.codestore.Service.list();
    if (!services.length) {
      this.log('You don\'t have any services yet. Try creating one by running `codestore service:create`.');
      return;
    }

    const rows = services.map((service) => ({
      id: service.uniqueName,
      name: service.displayName,
      // todo update when resolvers for deployments is ready
      status: service.status,
    }));

    this.renderTable(rows, {
      id: {
        header: 'Service ID',
      },
      name: {},
      status: {},
    });
  }
}
