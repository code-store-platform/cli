import { gray } from 'chalk';

export const createSuffix = (value: string): string => ` ${gray(`(${value})`)}:`;

export const createPrefix = (value: string): string => `${gray(`\n ${value}`)}\n`;
