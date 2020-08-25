import Command from '../../lib/command';
import EnvironmentEnum, { serviceEnvironments } from '../../common/constants/environment.enum';
import { IDeployment } from '../../interfaces/deployment.interface';

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
export const deploymentsToEnvronments = (deployments: IDeployment[], environments: EnvironmentEnum[]): DeploymentToEnvironment => {
  const result: DeploymentToEnvironment = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const environment of environments) {
    result[environment] = deployments.find((d) => d.environment.name === environment);
    if (!result[environment]) {
      throw new Error(`Deployment to environment ${environment} not found`);
    }
  }
  return result;
};

export const createColumns = (environments: EnvironmentEnum[]): object => {
  const result = { name: { header: '' } };
  environments.forEach((environment) => {
    result[environment] = {};
  });
  return result;
};

export default class Info extends Command {
  public static description = 'Displays detailed information about a service';

  public static args = [
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args } = this.parse(Info);

    let service;

    if (!args.serviceArgs) {
      try {
        const { serviceId } = await this.serviceWorker.loadValuesFromYaml();
        service = await this.codestore.Service.getService(serviceId);
      } catch (e) {
        service = await this.chooseService(args, 'Choose which service you want to display information about');
      }
    }
    if (!service) return;

    const deployments = await this.codestore.Deployment.getDeploymentsForService(service.id);
    const deploymentTo = deploymentsToEnvronments(deployments, serviceEnvironments);

    const createRows = (fields: Field[]): CreateRowResult[] => fields.map(({ name, resolve }) => ({
      name,
      private: resolve(deploymentTo[EnvironmentEnum.PRIVATE]!),
      demo: resolve(deploymentTo[EnvironmentEnum.DEMO]!),
    }));

    this.renderTable(createRows(getFieldResolvers()), createColumns(serviceEnvironments));
  }
}
