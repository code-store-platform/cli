import ux from 'cli-ux';
import * as clear from 'clear';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { paginationChoice } from '../../common/utils';

export default class List extends Command {
  static description = 'List your services';

  static aliases = [Aliases.SERVICE_LS];

  private currentPage = 1;

  // eslint-disable-next-line class-methods-use-this
  private renderTable(services: object[]) {
    ux.table(services, {
      id: {
        header: 'Service ID',
      },
      name: {},
      develop: {},
      demo: {},
    }, { 'no-truncate': true });
  }

  async renderList(): Promise<void> {
    const services = await this.codestore.Service.list(this.currentPage)
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

    this.renderTable(services);

    const choice = await paginationChoice();

    if (choice === 'Prev' && this.currentPage > 1) {
      this.currentPage -= 1;
    }
    if (choice === 'Next') {
      this.currentPage += 1;
    }
    if (choice === 'Done') {
      return;
    }
    clear();
    this.renderList();
  }

  async execute() {
    this.renderList();
  }
}
