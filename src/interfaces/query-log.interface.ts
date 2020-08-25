import EnvironmentEnum from '../common/constants/environment.enum';

export default interface IQueryLog {
  serviceUniqueName?: string;
  projectUniqueName?: string;
  serviceId?: number;
  projectId?: number;
  env?: EnvironmentEnum | string;
  sinceTime?: Date;
  num?: number;
}
