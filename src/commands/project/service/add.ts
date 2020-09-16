import { flags } from '@oclif/command';
import { blue, bold } from 'chalk';
import { Listr } from 'listr2';
import inquirer from 'inquirer';
import Command from '../../../lib/command';
import { createPrefix } from '../../../common/utils';
import ProjectServiceBillingType from '../../../common/constants/project-service-billing-type.enum';
import IProject from '../../../interfaces/project.interface';
import IService from '../../../interfaces/service.interface';

export default class Add extends Command {
  public static description = 'Adds and existing service to your project';

  public static args = [
    { name: 'projectArg', description: 'ID of the project' },
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public static flags = {
    project: flags.string({
      char: 'p',
      description: 'Project name',
    }),
    service: flags.string({
      char: 's',
      description: 'Service name',
    }),
    billingType: flags.string({
      char: 't',
      description: 'Billing type',
      dependsOn: ['billingValue'],
    }),
    billingValue: flags.string({
      char: 'v',
      description: 'Billing value',
      dependsOn: ['billingType'],
    }),
  };

  public async execute(): Promise<void> {
    const { args, flags: flagsData } = this.parse(Add);
    let project: IProject | undefined;
    let service: IService | undefined;
    let billingType = ProjectServiceBillingType.NOT_BILLABLE;
    let billingValue = '';

    if (Object.keys(flagsData).length) {
      const data = await this.validateFlags(Add.flags, flagsData);
      project = await this.findProject(data.project);
      if (!project) {
        this.error(`Project with id ${blue(data.project)} does not exist`);
      }
      service = await this.findService(data.service);
      if (!service) {
        this.error(`Service with id ${blue(data.service)} does not exist`);
      }
      if (data.billingType) {
        billingType = data.billingType as ProjectServiceBillingType;
        billingValue = data.billingValue;
      }
    } else {
      project = await this.chooseProject(args, 'Choose a project you want to add to');
      if (!project) return;

      service = await this.chooseService(args, 'Choose a service which you want to add');
      if (!service) return;

      const { wantToBill } = await inquirer.prompt({
        type: 'confirm',
        name: 'wantToBill',
        message: 'Enable billing:',
        prefix: createPrefix('Would you like to enable billing for your service?'),
      });

      if (wantToBill) {
        const userFriendlyBillingPlans = {
          'Pay Per Call': ProjectServiceBillingType.PAY_PER_CALL,
          'Monthly payments': ProjectServiceBillingType.MONTHLY,
        };
        const { howToBill } = await inquirer.prompt({
          type: 'list',
          name: 'howToBill',
          message: 'Billing plan:',
          choices: Object.keys(userFriendlyBillingPlans),
          prefix: createPrefix('Choose a billing plan for your service'),
        });
        billingType = userFriendlyBillingPlans[howToBill];

        billingValue = (await inquirer.prompt({
          type: 'input',
          validate: (value: string): string | boolean => {
            if (!value) {
              return 'Billing value is required';
            }
            return true;
          },
          name: 'billingValue',
          message: 'Billing value:',
          prefix: createPrefix('Enter a billing value for your service'),
        })).billingValue;
      }
    }
    const projectUniqueName = project.uniqueName;
    const serviceUniqueName = service.uniqueName;

    await new Listr<{}>([{
      title: `Including service with id ${blue(serviceUniqueName)} to project ${blue(projectUniqueName)}`,
      task: async (ctx, task): Promise<void> => {
        try {
          const { status } = await this.codestore.Project.includeServiceByUniqueName(projectUniqueName, serviceUniqueName, billingType, billingValue);
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

  // eslint-disable-next-line class-methods-use-this
  public get rules(): { [key: string]: (value: any) => string | boolean } {
    return {
      service: (value): string | boolean => {
        if (!value) {
          return 'ID of the service is required';
        }
        return true;
      },
      project: (value): string | boolean => {
        if (!value) {
          return 'ID of the project is required';
        }
        return true;
      },
      billingType: (value): string | boolean => {
        const billingTypes = [ProjectServiceBillingType.MONTHLY, ProjectServiceBillingType.PAY_PER_CALL];
        if (value && !billingTypes.includes(value)) {
          return `Billing type should be one of: ${billingTypes.join(', ')}`;
        }
        return true;
      },
    };
  }
}
