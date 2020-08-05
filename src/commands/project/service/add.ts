import { blue, bold } from 'chalk';
import { Listr } from 'listr2';
import Command from '../../../lib/command';

export default class Add extends Command {
  public static description = 'Adds and existing service to your project';

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
    { name: 'service_id', required: true, description: '(required) ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args: { service_id: serviceUniqueName, project_id: projectUniqueName } } = this.parse(Add);

    await new Listr<{}>([{
      title: `Including service with id ${blue(serviceUniqueName)} to project ${blue(projectUniqueName)}`,
      task: async (ctx, task): Promise<void> => {
        try {
          const { status } = await this.codestore.Project.includeServiceByUniqueName(projectUniqueName, serviceUniqueName);
          // eslint-disable-next-line no-param-reassign
          task.title = `Service ${blue(serviceUniqueName)} is included to project ${blue(projectUniqueName)}\nStatus: ${bold(status)}`;
        } catch (error) {
          if (error.message.match(/already includes/)) { // TODO: should be changed to error status code check later, when backend will support it.
            // eslint-disable-next-line no-param-reassign
            task.title = `Project ${blue(projectUniqueName)} already includes service ${blue(serviceUniqueName)}`;
          } else throw error;
        }
      },
    }]).run();
  }
}
