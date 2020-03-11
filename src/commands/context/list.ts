import ux from 'cli-ux';
import { bold, cyan } from 'chalk';
import { Command } from '../../lib/command';

export default class List extends Command {
  static description = 'List all globally set contexts';

  async run() {
    this.log('List of current contexts:');
    const data = [
      { context_type: 'Project ID', value: bold.cyan('prj-d28f33cf') },
      { context_type: 'Service ID', value: bold.cyan('srv-2b00042f') }];

    ux.table(data, { context_type: {}, value: {} }, { 'no-truncate': true });
  }
}
