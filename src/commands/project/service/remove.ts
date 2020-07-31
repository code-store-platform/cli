import { blue, bold } from 'chalk';
import { Listr } from 'listr2';
import Command from '../../../lib/command';

export default class Remove extends Command {
  public static description = 'Exclude service from project. This is a potentially destructive operation that might result in a loss of data.';

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
    { name: 'service_id', required: true, description: '(required) ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args: { project_id: projectUniqueName, service_id: serviceUniqueName } } = this.parse(Remove);

    await new Listr<{}>([{
      title: `Excluding service with id ${blue(serviceUniqueName)} from project ${blue(projectUniqueName)}`,
      task: async (ctx, task): Promise<void> => {
        const { status } = await this.codestore.Project.excludeServiceByUniqueName(projectUniqueName, serviceUniqueName);

        // eslint-disable-next-line no-param-reassign
        task.title = `Service ${blue(serviceUniqueName)} has been removed from project ${blue(projectUniqueName)}\nStatus: ${bold(status)}.`;
      },
    }]).run();
  }
}
