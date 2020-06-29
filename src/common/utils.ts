import { gray } from 'chalk';

// eslint-disable-next-line import/prefer-default-export
export const createSuffix = (value: string): string => ` ${gray(`(${value})`)}:`;
