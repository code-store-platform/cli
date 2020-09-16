import { flags } from '@oclif/command';
import inquirer, { QuestionCollection } from 'inquirer';
import { Listr } from 'listr2';
import { yellow, blue, bold } from 'chalk';
import Command from '../../lib/command';
import { createPrefix } from '../../common/utils';
import STRING_LENGTH from '../../common/constants/string.length.enum';
import { IProjectCreate } from '../../interfaces/project.interface';

export default class Create extends Command {
  public static description = 'Creates a new project, where you can add services';

  public static flags = {
    name: flags.string({
      char: 'n',
      description: 'Project name',
    }),
    description: flags.string({
      char: 'd',
      description: `A short description of your project. ${STRING_LENGTH.MAX} chars max.`,
    }),
  };

  public async execute(): Promise<void> {
    let data: IProjectCreate;
    const { flags: flagsData } = this.parse(Create);

    if (Object.keys(flagsData).length) {
      data = { ...await this.validateFlags(Create.flags, flagsData), proceed: true };
    } else {
      const questions = this.getQuestions();
      data = await inquirer.prompt(questions) as IProjectCreate;
    }

    const { proceed, name, description } = data;

    if (!proceed) {
      this.log('Project has not been created');
      return;
    }

    const tasks = new Listr<{}>([{
      title: `Creating Project "${bold(name)}"`,
      task: async (ctx, task): Promise<void> => {
        const { uniqueName, name: projectName } = await this.codestore.Project.create({ name, description });

        // eslint-disable-next-line no-param-reassign
        task.title = `Your service "${bold(projectName)}" with ID ${blue(uniqueName)} has been created!
You can now add your services there using ${yellow(' codestore project:service ')} command.`;
      },
      options: { persistentOutput: true },
    }]);

    await tasks.run();
  }

  // eslint-disable-next-line class-methods-use-this
  protected get rules(): { [key: string]: (value: any) => string | boolean } {
    return {
      description: (value): string | boolean => {
        const name = 'Description';
        if (!value) {
          return `${name} is required`;
        }
        if (value.length > STRING_LENGTH.MAX) {
          return `${name} should be less than ${STRING_LENGTH.MAX} characters`;
        }
        return true;
      },
      name: (value): string | boolean => {
        const name = 'Project name';
        if (!value) {
          return `${name} is required`;
        }
        if (value.length >= STRING_LENGTH.MEDIUM) {
          return `${name} should be less than ${STRING_LENGTH.MEDIUM} characters`;
        }

        if (value.length < STRING_LENGTH.MIN) {
          return `${name} must be longer than or equal to ${STRING_LENGTH.MIN} characters`;
        }
        return true;
      },
    };
  }

  private getQuestions(): QuestionCollection {
    return [{
      name: 'name',
      message: 'Name:',
      validate: (value): Promise<string | boolean> => this.validate('name', value),
      prefix: createPrefix('What is your project\'s name?'),
      type: 'input',
    }, {
      name: 'description',
      message: 'Description:',
      validate: (value): Promise<string | boolean> => this.validate('description', value),
      prefix: createPrefix(`Please add a short description of your project. ${STRING_LENGTH.MAX} chars max`),
      type: 'input',
    }, {
      name: 'proceed',
      message: 'Is everything ok, can I create this project?',
      type: 'confirm',
    }];
  }
}
