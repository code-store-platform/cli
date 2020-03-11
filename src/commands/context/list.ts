import ux from 'cli-ux';
import { Command } from '../../lib/command';

export default class List extends Command {
  static description = 'List all globally set contexts';

  async run() {
    const data = [
      { context_type: 'Project ID', value: 'PTF-123' },
      { context_type: 'Service ID', value: 'S-325gpz21' }];

    ux.table(data, { context_type: {}, value: {} });
  }
}
