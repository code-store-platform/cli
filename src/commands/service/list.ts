import { flags } from '@oclif/command';
import { bold } from 'chalk';
import ux from 'cli-ux';
import { Command } from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  static description = 'List your services';

  static aliases = [Aliases.SERVICE_LS];

  static flags = {
    all: flags.boolean({
      char: 'a',
      description: 'List all services',
    }),
    'project-id': flags.string({
      char: 'p',
      description: 'Project ID',
    }),
  };

  async run() {
    const { flags: userFlags } = this.parse(List);

    if (userFlags.all && userFlags['project-id']) {
      this.error('Flags --all and --project-id cannot be used together');
    } else if (userFlags.all) {
      // listing all services
      ux.table([
        {
          id: 'S-d28f33cf',
          name: 'leshack-shopping-cart',
          status: bold.green('Active'),
        },
      ], {
        id: {
          header: 'Service ID',
        },
        name: {},
        status: {},
      }, { 'no-truncate': true });
    } else if (userFlags['project-id']) {
      // listing services for a specific project
      this.log(`Listing all services for project: ${bold(userFlags['project-id'])}\n`);

      ux.table([
        {
          id: 'S-d28f33cf',
          name: 'leshack-shopping-cart',
          dev: '',
          stage: '',
          preprod: '',
          prod: '',
        },
      ], {
        id: { header: 'Service ID' },
        name: {},
        dev: {},
        stage: {},
        preprod: {},
        prod: {},
      }, {});
    } else {
      // listing
      this.log('Display all services for current project');
    }
  }
}
