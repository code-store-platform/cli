import { flags } from '@oclif/command';
import { bold } from 'chalk';

import Command from '../../lib/command';

export default class Project extends Command {
  static description = 'Manage global project context';

  static flags = {
    clear: flags.boolean({
      char: 'c',
      description: 'Clear project context',
    }),
  };

  static args = [
    {
      name: 'projectID',
    },
  ];

  async execute() {
    const { flags: userFlags, args } = this.parse(Project);

    if (userFlags.clear) {
      this.log('Cleared project context');
    } else if (args.projectID) {
      // TODO: check that project exists remotely
      this.log(`Saved context for project ${bold(args.projectID)}`);
    } else {
      this.error('projectID is required');
      this.exit(1);
    }
  }
}
