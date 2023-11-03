function camelCase(str: string) {
  return Array.from(str)
    .map((c, i) => (i === 0 ? c.toUpperCase() : c))
    .join('');
}

export const hasOperationName = (req: any, operationName: string) => {
  const { body } = req;
  return (
    Object.prototype.hasOwnProperty.call(body, 'operationName') &&
    body.operationName === operationName
  );
};

// Alias query if operationName matches
export const aliasQuery = (req: any, operationName: string) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${camelCase(operationName)}Query`;
  }
};

// Alias mutation if operationName matches
export const aliasMutation = (req: any, operationName: string) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${camelCase(operationName)}Mutation`;
  }
};

export const testGraphqlUrl = 'http://mocked-api/graphql';
