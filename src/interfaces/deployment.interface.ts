import DeploymentStatusEnum from '../common/constants/deployment-status.enum';
import IVersion from './version.interface';
import IEnvironment from './environment.interface';
import IService from './service.interface';

export interface IDeployment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  environmentId: number;
  serviceId: number;
  status: DeploymentStatusEnum;
  commitId: string;
  endpoint: string;
  version: IVersion;
  environment: IEnvironment;
  service?: IService;
}
