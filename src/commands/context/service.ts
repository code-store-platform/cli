import { flags } from '@oclif/command';
import { bold } from 'chalk';

import { Command } from '../../lib/command';

export default class Service extends Command {
  static description = 'Manage global service context';

  static flags = {
    clear: flags.boolean({
      char: 'c',
      description: 'Clear service context',
    }),
  };

  static args = [
    {
      name: 'serviceID',
    },
  ];

  async execute() {
    const { flags: userFlags, args } = this.parse(Service);

    if (userFlags.clear) {
      this.log('Cleared service context');
    } else if (args.serviceID) {
      // TODO: check that service exists remotely
      this.log(`Saved context for service ${bold(args.serviceID)}`);
    } else {
      this.error('serviceID is required');
    }
  }
}
