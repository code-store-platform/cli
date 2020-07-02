import { ux } from 'cli-ux';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'Lists projects in your organization';

  public static aliases = [Aliases.PROJECT_LS];

  public static flags = {
    ...ux.table.flags(),
  };

  public async execute(): Promise<void> {
    const projects = await this.codestore.Project.list()
      .then((list) => list.map((it) => ({
        ...it,
        services: it.services.length,
        author: it.author.email,
      })));

    if (!projects.length) {
      this.error('You talking to me? There are no projects yet, you should try create one using codestore project:create command.');
      return;
    }

    if (!projects.length) {
      this.error('You talking to me? There are no projects yet, you should try create one using codestore project:create command.');
      return;
    }

    this.renderTable(projects, {
      id: {
        header: 'Project ID',
      },
      name: {},
      services: {},
      author: {},
      description: {},
    });
  }
}
