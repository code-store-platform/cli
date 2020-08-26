import { gray } from 'chalk';
import { IntrospectionField, IntrospectionObjectType } from 'graphql';
import { PromisifiedFs } from 'codestore-utils';
import crypto from 'crypto';

export const createSuffix = (value: string): string => ` ${gray(`(${value})`)}:`;

export const createPrefix = (value: string): string => `${gray(`\n ${value}`)}\n`;

// service worker utilities

export const loadSchemaFields = (introspection, name: 'Query' | 'Mutation'): string[] => {
  const type: IntrospectionObjectType = introspection.__schema.types.find((it) => it.name === name) as IntrospectionObjectType;

  return type ? type.fields.map((field: IntrospectionField) => field.name) : [];
};

export const findDiff = (loadedResolvers, schemaResolvers): string[] => {
  if (!loadedResolvers) {
    return [];
  }

  return loadedResolvers.filter((resolver) => !schemaResolvers.find((schemaResolver) => schemaResolver === resolver));
};

export async function generateChecksumForFile(path: string): Promise<string> {
  const file = await PromisifiedFs.readFile(path, { encoding: 'utf8' });
  return crypto
    .createHash('sha256')
    .update(file, 'utf8')
    .digest('hex');
}
