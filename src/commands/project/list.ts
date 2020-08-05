import { yellow } from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'List projects in your organization';

  public static aliases = [Aliases.PROJECT_LS];

  public async execute(): Promise<void> {
    const projects = await this.codestore.Project.list()
      .then((list) => list.map((project) => ({
        id: project.uniqueName,
        services: project.services!.length,
        author: project.author!.email,
        description: project.description,
      })));

    if (!projects.length) {
      this.log(`There are no projects yet, try creating one using ${yellow(' codestore project:create ')} command.`);
      return;
    }

    this.renderTable(projects, {
      id: {
        header: 'Project ID',
      },
      services: {},
      author: {},
      description: {},
    });
  }
}
