export interface IService {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  status: string;
  state: string;
  repositoryUrl: string;
  userId: number;
  displayName: string;
  organizationId: number;
  private: boolean;
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