import { flags } from '@oclif/command';
import { bold } from 'chalk';
import Command from '../../lib/command';
import ILog from '../../interfaces/log.interface';
import IQueryLog from '../../interfaces/query-log.interface';
import Environments from '../../common/constants/env.enum';
import Aliases from '../../common/constants/aliases';
import { FETCH_INTERVAL, NUMBER_OF_LINES } from '../../common/constants/logs';

export default class Logs extends Command {
  public logs: ILog[] = [];

  public static description = 'Print the logs for your services';

  public static aliases = [Aliases.LOGS];

  public static flags = {
    follow: flags.boolean({
      char: 'f',
      description: 'Specify if the logs should be streamed.',
    }),
    num: flags.integer({
      char: 'n',
      description: 'Number of most recent log lines to display.',
      default: NUMBER_OF_LINES,
    }),
    env: flags.enum({
      char: 'e',
      description: 'Project environment.',
      default: Environments.DEVELOPMENT,
      options: Object.values(Environments),
    }),
    projectId: flags.integer({
      char: 'p',
      description: 'Project ID',
    }),
    serviceId: flags.integer({
      char: 's',
      description: 'Service ID',
    }),
  };

  public async fetch(query: IQueryLog): Promise<Array<ILog>> {
    return this.codestore.Logs.list(query);
  }

  public async updateLogs(query: IQueryLog): Promise<void> {
    this.logs = await this.fetch(query);
  }

  public render(noHeader: boolean): void {
    this.renderTable(this.logs.map((log) => ({
      time: bold.white(log.time),
      message: bold.cyan(log.message.trim()),
    })), { time: {}, message: {} }, { 'no-truncate': true, 'no-header': noHeader });
  }

  public async execute(): Promise<void> {
    const { flags: { follow, ...query } } = this.parse(Logs);

    if (!query.serviceId && !query.projectId) {
      const { serviceId } = await this.serviceWorker.loadValuesFromYaml();
      if (!serviceId) {
        this.error('Please specify the service or project.');
      } else {
        query.serviceId = serviceId;
      }
    }

    this.log(`Displaying logs for environment ${query.env}${query.serviceId ? `, service ${query.serviceId}` : ''}${query.projectId ? `, project ${query.projectId}` : ''}`);

    await this.updateLogs(query);
    this.render(false);

    if (follow) {
      setInterval(async () => {
        if (this.logs.length) {
          (query as any).sinceTime = new Date(this.logs[this.logs.length - 1].time);
        }
        await this.updateLogs(query);
        this.render(true);
      }, FETCH_INTERVAL);
    }
  }
}
