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
      options: Object.values(Environments),
    }),
    projectUniqueName: flags.string({
      char: 'p',
      description: 'Project ID',
    }),
    serviceUniqueName: flags.string({
      char: 's',
      description: 'Service ID',
    }),
  };

  public async fetch(query: IQueryLog): Promise<Array<ILog>> {
    console.log(query)
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

    const env: Environments = query.env || query.projectUniqueName ? Environments.DEVELOPMENT : Environments.PRIVATE;

    const newQuery: IQueryLog = {
      num: query.num,
      env,
      serviceUniqueName: query.serviceUniqueName,
      projectUniqueName: query.projectUniqueName,
    };

    if (!query.serviceUniqueName && !query.projectUniqueName) {
      const { serviceId } = await this.serviceWorker.loadValuesFromYaml();

      if (!serviceId) {
        this.error('Please specify the service or project.');
      } else {
        newQuery.serviceId = serviceId;
      }
    }

    this.log(`Displaying logs for environment ${env}${query.serviceUniqueName ? `, service ${query.serviceUniqueName}` : ''}${query.projectUniqueName ? `, project ${query.projectUniqueName}` : ''}`);

    await this.updateLogs(newQuery);
    this.render(false);

    if (follow) {
      setInterval(async () => {
        if (this.logs.length) {
          (newQuery as any).sinceTime = new Date(this.logs[this.logs.length - 1].time);
        }
        await this.updateLogs(newQuery);
        this.render(true);
      }, FETCH_INTERVAL);
    }
  }
}
