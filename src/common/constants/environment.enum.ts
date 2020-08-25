enum EnvironmentEnum {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  DEMO = 'demo',
  PRIVATE = 'private',
}

export default EnvironmentEnum;

export const serviceEnvironments = [
  EnvironmentEnum.PRIVATE,
  EnvironmentEnum.DEMO,
];

export const projectServiceEnvironments = [
  EnvironmentEnum.DEVELOPMENT,
  EnvironmentEnum.STAGING,
  EnvironmentEnum.PRODUCTION,
];
