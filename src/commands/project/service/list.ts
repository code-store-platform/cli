import ux from 'cli-ux';
import { blue } from 'chalk';
import Command from '../../../lib/command';
import Aliases from '../../../common/constants/aliases';
import IService from '../../../interfaces/service.interface';

export default class List extends Command {
  public static description = 'Lists services in your project';

  public static aliases = [Aliases.PROJECT_SERVICE_LS];

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
  ];

  private mapData = (project: any): { development: string; staging: string; production: string }[] => {
    const development = project.environments.find((e) => e.name === 'development');
    const staging = project.environments.find((e) => e.name === 'staging');
    const production = project.environments.find((e) => e.name === 'production');

    const versionName = (env: any, serviceId: number): string => env
      ?.deployments
      ?.find((deployment) => deployment.serviceId === serviceId)
      ?.version
      ?.name;

    return project.services.map((service: IService) => ({
      id: service.uniqueName,
      name: service.displayName,
      development: versionName(development, service.id),
      staging: versionName(staging, service.id),
      production: versionName(production, service.id),
    }));
  };

  public async execute(): Promise<void> {
    const { args: { project_id: projectUniqueName } } = this.parse(List);

    const project = await this.codestore.Project.singleWithEnvsByUniqueName(projectUniqueName);

    if (!project) {
      this.log(`There is no project with ID ${blue(projectUniqueName)}`);
      return;
    }

    ux.table(this.mapData(project), {
      id: {
        header: 'Service ID',
      },
      name: {},
      development: {},
      staging: {},
      production: {},
    }, { 'no-truncate': true });
  }
}
