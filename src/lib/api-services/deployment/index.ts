import * as queries from './queries';
import ApiService from '../base-api-service';
import { IDeployment } from '../../../interfaces/deployment.interface';
import DeploymentStatusEnum from '../../../common/constants/deployment-status.enum';

export default class Deployment extends ApiService {
  public constructor(args: any) {
    super(args);
  }

  public async getDeployment(serviceId: number): Promise<IDeployment> {
    const { data } = await this.executeQuery(queries.GET_DEPLOYMENT, {
      serviceId,
    });

    return data.deploymentByServiceAndEnvironment;
  }

  public async getDeploymentsForService(serviceId: number): Promise<IDeployment[]> {
    const { data } = await this.executeQuery(queries.GET_DEPLOYMENTS_FOR_SERVICE, {
      serviceId,
    });

    return data.deploymentsForService;
  }

  public async getDeploymentsForServices(serviceIds: number[]): Promise<IDeployment[]> {
    const { data } = await this.executeQuery(queries.GET_DEPLOYMENTS_FOR_SERVICES, {
      serviceIds,
    });

    return data.deploymentsForServices;
  }

  public async getDeploymentsForProjectService(projectId: number, serviceId: number): Promise<IDeployment[]> {
    const { data } = await this.executeQuery(queries.GET_DEPLOYMENTS_FOR_PROJECT_SERVICE, {
      projectId,
      serviceId,
    });

    return data.deploymentsForProjectService;
  }

  public async checkDeployment(serviceId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const service = await this.getDeployment(serviceId);
        if (service.status === DeploymentStatusEnum.DEPLOYED) {
          resolve(true);
          clearInterval(interval);
        }
        if (service.status === DeploymentStatusEnum.DEPLOYMENT_FAILED) {
          reject(new Error('Deployment has failed'));
          clearInterval(interval);
        }
      }, 3000);
    });
  }
}
