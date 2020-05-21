import { prompt } from 'inquirer';
import { gray } from 'chalk';

export const paginationChoice = async () => {
  const { choice } = await prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Next action?',
      choices: ['Next', 'Prev', 'Done'],
    },
  ]);

  return choice;
};

export const createSuffix = (value: string) => ` ${gray(`(${value})`)}:`;
