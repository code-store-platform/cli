import { flags } from '@oclif/command';
import { white, yellow, green } from 'chalk';
import Command from '../../lib/command';
import ILog from '../../interfaces/log.interface';
import IQueryLog from '../../interfaces/query-log.interface';
import EnvironmentEnum from '../../common/constants/environment.enum';
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
      options: Object.values(EnvironmentEnum),
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
    return this.codestore.Logs.list(query);
  }

  public async updateLogs(query: IQueryLog): Promise<void> {
    this.logs = await this.fetch(query);
  }

  public render(): void {
    this.logs.forEach((log) => {
      const time = white(new Date(log.time).toISOString());
      const context = log.context ? yellow(`[${log.context.trim()}] `) : '';
      const message = green(log.message.trim());
      this.log(`${time} ${context}${message}`);
    });
  }

  public async execute(): Promise<void> {
    const { flags: { follow, ...query } } = this.parse(Logs);

    let { env } = query;
    if (!env) env = query.projectUniqueName ? EnvironmentEnum.DEVELOPMENT : EnvironmentEnum.PRIVATE;

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
    this.render();

    if (follow) {
      setInterval(async () => {
        if (this.logs.length) {
          (newQuery as any).sinceTime = new Date(this.logs[this.logs.length - 1].time);
        }
        await this.updateLogs(newQuery);
        this.render();
      }, FETCH_INTERVAL);
    }
  }
}
