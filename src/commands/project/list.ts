import { ux } from 'cli-ux';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'Lists projects in your organization';

  public static aliases = [Aliases.PROJECT_LS];

  public static flags = {
    ...ux.table.flags(),
  };

  public async execute() {
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
