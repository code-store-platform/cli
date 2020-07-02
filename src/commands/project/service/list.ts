import ux from 'cli-ux';
import Command from '../../../lib/command';
import Aliases from '../../../common/constants/aliases';

export default class List extends Command {
  public static description = 'Lists projects in your organization';

  public static aliases = [Aliases.PROJECT_SERVICE_LS];

  public static args = [
    { name: 'id', required: true },
  ];

  private mapData = (input: any) => {
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
    const { args: { id } } = this.parse(List);

    const data = await this.codestore.Project.singleWithEnvs(+id);

    this.log(`Fetching services for project with id ${id}`);

    ux.table(this.mapData(data), {
      name: {},
      development: {},
      staging: {},
      production: {},
    }, { 'no-truncate': true });
  }
}
