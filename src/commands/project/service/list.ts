import ux from 'cli-ux';
import Command from '../../../lib/command';
import Aliases from '../../../common/constants/aliases';

export default class List extends Command {
  public static description = 'Lists services in your project';

  public static aliases = [Aliases.PROJECT_SERVICE_LS];

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
  ];

  private mapData = (input: any): { development: string; staging: string; production: string }[] => {
    const { data } = input;

    const development = data.project.environments.find((it) => it.name === 'development');
    const staging = data.project.environments.find((it) => it.name === 'staging');
    const production = data.project.environments.find((it) => it.name === 'production');

    return data.project.services.map((service) => ({
      name: service.name,
      development: `${this.apiPath}/${data.project.id}/${development.id}/${service.id}/graphql`,
      staging: `${this.apiPath}/${data.project.id}/${staging.id}/${service.id}/graphql`,
      production: `${this.apiPath}/${data.project.id}/${production.id}/${service.id}/graphql`,
    }));
  };

  public async execute(): Promise<void> {
    let { args: { project_id: projectId } } = this.parse(List);
    projectId = Number(projectId);

    const data = await this.codestore.Project.singleWithEnvs(projectId);

    this.log(`Fetching services for project with id ${projectId}`);

    ux.table(this.mapData(data), {
      name: {},
      development: {},
      staging: {},
      production: {},
    }, { 'no-truncate': true });
  }
}
