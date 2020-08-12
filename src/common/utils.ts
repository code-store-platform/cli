import { gray } from 'chalk';
import { IntrospectionField, IntrospectionObjectType } from 'graphql';

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
