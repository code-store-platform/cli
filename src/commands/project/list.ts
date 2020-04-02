import { ux } from 'cli-ux';
import { Command } from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  static description = 'Lists projects in your organization';

  static aliases = [Aliases.PROJECT_LS];

  static flags = {
    ...ux.table.flags(),
  };

  async execute() {
    const { flags: userflags } = this.parse(List);

    // this.warn(`You haven't created any projects yet. You can create them using ${italic('$ cs project:add')}.`);
    ux.table([
      {
        identifier: 'leshack-meeting-rooms',
        name: 'LeShack meeting rooms',
        description: 'LeShack meeting rooms reservation service',
      },
      {
        identifier: 'code-store-public-site',
        name: 'Code.Store public site',
        description: 'Backend for code.store public sitee',
      },
    ], {
      identifier: {},
      name: {},
      description: {
        extended: true,
      },
    }, {
      extended: userflags.extended,
    });
  }
}
