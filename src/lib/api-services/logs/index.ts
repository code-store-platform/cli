import ILog from '../../../interfaces/log.interface';
import IQueryLog from '../../../interfaces/query-log.interface';
import { GET_LOGS } from './queries';

export default class Logs {
  public constructor(private readonly apiClient) {
  }

  public async list(query: IQueryLog): Promise<Array<ILog>> {
    const { data: { logs } } = await this.apiClient.query({
      query: GET_LOGS,
      variables: {
        query,
      },
    });
    return logs;
  }
}
