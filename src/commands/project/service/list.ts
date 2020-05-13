import ux from 'cli-ux';
import Command from '../../../lib/command';
import Aliases from '../../../common/constants/aliases';

export default class List extends Command {
  static description = 'Lists projects in your organization';

  static aliases = [Aliases.PROJECT_SERVICE_LS];

  static args = [
    { name: 'id' },
  ];

  async execute() {
    const { args: { id } } = this.parse(List);
    if (!id) {
      throw new Error('Id must be provided, please use project:service:list {id}');
    }

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
