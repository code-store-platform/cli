export const PROJECT = `
  id
  name
  status
  description
  uniqueName
`;

export const SERVICE = `
  id
  createdAt
  updatedAt
  status
  state
  repositoryUrl
  displayName
  organizationId
  private
  uniqueName
  howSolving
  problemSolving
`;

export const VERSION = `
  id
  commitId
  createdAt
  updatedAt
  serviceId
  name
  description
`;

export const DEPLOYMENT = `
  id
  createdAt
  updatedAt
  environmentId
  serviceId
  status
  commitId
  endpoint
  version {
    ${VERSION}
    service {
      ${SERVICE}
    }
  }
`;

export const DEPLOYMENT_WITH_ENVIRONMENT_NAME = `
  ${DEPLOYMENT}
  environment {
    name
  }
`;
