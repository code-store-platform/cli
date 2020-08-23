import DeploymentStatusEnum from '../common/constants/deployment-status.enum';

export interface IDeployment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  environmentId: number;
  serviceId: number;
  status: DeploymentStatusEnum;
  commitId: string;
  endpoint: string;
}
