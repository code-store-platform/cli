import EnvironmentEnum from '../common/constants/environment.enum';
import { IDeployment } from './deployment.interface';

export default interface IEnvironment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deployments?: IDeployment[];
  name: EnvironmentEnum;
  status: string;
  projectId: number;
}
