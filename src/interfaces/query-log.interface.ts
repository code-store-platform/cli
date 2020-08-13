import Environments from '../common/constants/env.enum';

export default interface IQueryLog {
  serviceUniqueName?: string;
  projectUniqueName?: string;
  serviceId?: number;
  projectId?: number;
  env?: Environments | string;
  sinceTime?: Date;
  num?: number;
}
