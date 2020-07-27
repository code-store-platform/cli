import inquirer from 'inquirer';
import Command from '../../../lib/command';

export default class Promote extends Command {
  public static description = 'Promotes service inside the project between Development, Stating and Production environments';

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
    { name: 'service_id', required: true, description: '(required) ID of the service' },
  ];

  public async execute(): Promise<void> {
    let { args: { project_id: projectId, service_id: serviceId } } = this.parse(Promote);
    projectId = Number(projectId);
    serviceId = Number(serviceId);

    const { targetEnvironment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetEnvironment',
        message: 'Please select the environment',
        choices: [
          'development',
          'staging',
          'production',
        ],
      },
    ]);

    const promoteData = {
      projectId,
      serviceId,
      targetEnvironment,
    };

    const { data: { promoteServiceInProject } } = await this.codestore.Project.promoteService(promoteData);

    this.log(`Updated ${targetEnvironment} in project ${projectId}, deployment: ${promoteServiceInProject.id}`);
  }
}
