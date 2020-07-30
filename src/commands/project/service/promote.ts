import inquirer from 'inquirer';
import { yellow } from 'chalk';
import Command from '../../../lib/command';
import { createPrefix } from '../../../common/utils';

export default class Promote extends Command {
  public static description = 'Promotes service inside the project between Development, Stating and Production environments';

  public static args = [
    { name: 'project_id', description: 'ID of the project (optional)' },
    { name: 'service_id', description: 'ID of the service (optional)' },
  ];

  public async execute(): Promise<void> {
    let { args: { project_id: projectId, service_id: serviceId } } = this.parse(Promote);
    projectId = Number(projectId);
    serviceId = Number(serviceId);

    if (!projectId) {
      const projects = await this.codestore.Project.list();
      const map = new Map(projects.map((p) => [
        `${p.id}\t${p.name}\t${p.description}`,
        p.id,
      ]));

      if (!projects.length) {
        this.log(`There are no projects yet, try creating one using ${yellow(' codestore project:create ')} command.`);
        return;
      }

      const { project } = await inquirer.prompt<{project: string}>([
        {
          type: 'list',
          name: 'project',
          message: 'Project:',
          prefix: createPrefix('Choose a project you want to promote to'),
          choices: Array.from(map).map((it) => it[0]),
        },
      ]);

      projectId = map.get(project);
    }

    if (!serviceId) {
      const services = await this.codestore.Service.list();
      const map = new Map(services.map((s) => [
        `${s.id}\t${s.displayName}\t${s.problemSolving}`,
        s.id,
      ]));

      if (!services.length) {
        this.log(`There are no services yet, try creating one using ${yellow(' codestore service:create ')} command.`);
        return;
      }

      const { service } = await inquirer.prompt<{service: string}>([
        {
          type: 'list',
          name: 'service',
          message: 'Service:',
          prefix: createPrefix('Choose a service which you want to promote'),
          choices: Array.from(map).map((it) => it[0]),
        },
      ]);

      serviceId = map.get(service);
    }

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
