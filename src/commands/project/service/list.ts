import ux from 'cli-ux';
import Command from '../../../lib/command';
import Aliases from '../../../common/constants/aliases';

export default class List extends Command {
  public static description = 'Lists projects in your organization';

  public static aliases = [Aliases.PROJECT_SERVICE_LS];

  public static args = [
    { name: 'id', required: true },
  ];

  public async execute() {
    const { args: { id } } = this.parse(List);

    const { services } = await this.codestore.Project.single(+id, true);

    this.log(`Fetching services for project with id ${id}`);

    ux.table(services, {
      id: {
        header: 'Service ID',
      },
      name: {},
      develop: {},
      demo: {},
    }, { 'no-truncate': true });
  }
}
