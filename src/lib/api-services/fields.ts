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

export const DEPLOYMENT = `
      id
      createdAt
      updatedAt
      environmentId
      serviceId
      status
      commitId
      endpoint
`;
