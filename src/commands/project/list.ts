import { ux } from 'cli-ux';
import * as clear from 'clear';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { paginationChoice } from '../../common/utils';

export default class List extends Command {
  static description = 'Lists projects in your organization';

  static aliases = [Aliases.PROJECT_LS];

  static flags = {
    ...ux.table.flags(),
  };

  private currentPage = 1;

  private renderTable(projects: object[]) {
    ux.table(projects, {
      id: {
        header: 'Project ID',
      },
      name: {},
      status: {},
    }, { 'no-truncate': true });
  }

  private async renderList() {
    const projects = await this.codestore.Project.list(this.currentPage);

    this.renderTable(projects);

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
