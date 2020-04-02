import ux from 'cli-ux';
import { bold } from 'chalk';
import { Command } from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  static description = 'List all globally set contexts';

  static aliases = [Aliases.CONTEXT_LS];

  async execute() {
    const data = [
      { context_type: 'Project ID', value: bold.cyan('prj-d28f33cf') },
      { context_type: 'Service ID', value: bold.cyan('srv-2b00042f') }];

    ux.table(data, { context_type: {}, value: {} }, { 'no-truncate': true });
  }
}
