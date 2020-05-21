import { ux } from 'cli-ux';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  static description = 'Lists projects in your organization';

  static aliases = [Aliases.PROJECT_LS];

  static flags = {
    ...ux.table.flags(),
  };

  async execute() {
    const projects = await this.codestore.Project.list();

    this.renderTable(projects, {
      id: {
        header: 'Project ID',
      },
      name: {},
      status: {},
    });
  }
}
