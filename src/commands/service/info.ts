import { flags } from '@oclif/command';
import Command from '../../lib/command';
import EnvironmentEnum, { serviceEnvironments } from '../../common/constants/environment.enum';
import { IDeployment } from '../../interfaces/deployment.interface';
import IService from '../../interfaces/service.interface';

export type Resolver = (deployment: IDeployment) => string;
export type Field = { name: string; resolve: Resolver };
export type CreateRowResult = { name: string;[key: string]: string };

const versionResolver: Resolver = (deployment: IDeployment): string => (deployment.version ? deployment.version.name : '');
const deployedResolver: Resolver = (deployment: IDeployment): string => new Date(+deployment.updatedAt).toLocaleString();
const urlResolver: Resolver = (deployment: IDeployment): string => Command.getServiceUrl(deployment);

export const getFieldResolvers = (): Field[] => [{
  name: 'version',
  resolve: versionResolver,
}, {
  name: 'deployed',
  resolve: deployedResolver,
}, {
  name: 'url',
  resolve: urlResolver,
}];

type DeploymentToEnvironment = { [key in EnvironmentEnum]?: IDeployment };
export const deploymentsToEnvironments = (deployments: IDeployment[], environments: EnvironmentEnum[]): DeploymentToEnvironment => {
  const result: DeploymentToEnvironment = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const environment of environments) {
    result[environment] = deployments.find((d) => d.environment.name === environment);
  }
  return result;
};

export const createColumns = (environments: EnvironmentEnum[], deployments: DeploymentToEnvironment): object => {
  const result = { name: { header: '' } };
  environments.forEach((environment) => {
    if (deployments[environment]) {
      result[environment] = {};
    }
  });
  return result;
};

export default class Info extends Command {
  public static description = 'Displays detailed information about a service';

  public static args = [
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public static flags = {
    service: flags.string({
      char: 's',
      description: 'ID of the service',
    }),
  };

  public async execute(): Promise<void> {
    let service: IService | undefined;
    const { args, flags: { service: serviceFlag } } = this.parse(Info);

    if (serviceFlag) {
      service = await this.codestore.Service.getServiceByUniqueName(serviceFlag);
      if (!service) {
        this.error(`Service with ID ${serviceFlag} does not exist`);
      }
    } else {
      try {
        const { serviceId } = await this.serviceWorker.loadValuesFromYaml();
        service = await this.codestore.Service.getService(serviceId);
      } catch (e) {
        service = await this.chooseService(args, 'Choose which service you want to display information about');
      }
    }
    if (!service) return;

    const deployments = await this.codestore.Deployment.getDeploymentsForService(service.id);
    const deploymentTo = deploymentsToEnvironments(deployments, serviceEnvironments);

    const createRows = (fields: Field[]): CreateRowResult[] => fields.map(({ name, resolve }) => ({
      name,
      private: resolve(deploymentTo[EnvironmentEnum.PRIVATE]!),
      demo: resolve(deploymentTo[EnvironmentEnum.DEMO]!),
    }));

    this.renderTable(createRows(getFieldResolvers()), createColumns(serviceEnvironments, deploymentTo));
  }
}
