import ILog from '../../../interfaces/log.interface';
import IQueryLog from '../../../interfaces/query-log.interface';
import { GET_LOGS } from './queries';
import ApiService from '../base-api-service';

export default class Logs extends ApiService {
  public constructor(props) {
    super(props);
  }

  public async list(query: IQueryLog): Promise<Array<ILog>> {
    const { data: { logs } } = await this.executeQuery(GET_LOGS, { query });
    return logs;
  }
}
