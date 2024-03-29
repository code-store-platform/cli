import { IDeployment } from './deployment.interface';

export default interface IService {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  status: string;
  state: string;
  repositoryUrl: string;
  userId: number;
  displayName: string;
  organizationId: number;
  private: boolean;
  uniqueName: string;
  howSolving: string;
  problemSolving: string;
  deployments?: IDeployment[];
}

export interface IServiceCreateResult {
  service: IService;
  commitId: string;
}

export interface IServiceCreate {
  name: string;
  private: boolean;
  businessDomain: string;
  tags?: string;
  problemSolving: string;
  howSolving: string;
}

export type IServiceDataUI = Omit<IServiceCreate, 'problemSolving'> & { problem: string };
