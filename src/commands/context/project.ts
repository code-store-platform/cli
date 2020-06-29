import { flags } from '@oclif/command';
import { bold } from 'chalk';

import Command from '../../lib/command';

export default class Project extends Command {
  public static description = 'Manage global project context';

  public static flags = {
    clear: flags.boolean({
      char: 'c',
      description: 'Clear project context',
    }),
  };

  public static args = [
    {
      name: 'projectID',
    },
  ];

  public async execute(): Promise<void> {
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
