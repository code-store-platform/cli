import ux from 'cli-ux';
import { bold } from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class List extends Command {
  public static description = 'List all globally set contexts';

  public static aliases = [Aliases.CONTEXT_LS];

  // eslint-disable-next-line class-methods-use-this
  public async execute() {
    const data = [
      { context_type: 'Project ID', value: bold.cyan('prj-d28f33cf') },
      { context_type: 'Service ID', value: bold.cyan('srv-2b00042f') }];

    ux.table(data, { context_type: {}, value: {} }, { 'no-truncate': true });
  }
}
