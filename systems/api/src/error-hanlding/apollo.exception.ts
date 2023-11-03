import { GraphQLError } from 'graphql';

import type { ExceptionPayload } from './exception-payload';

export class ApolloException extends GraphQLError {
  constructor(response: ExceptionPayload) {
    super('Graphql Error', {
      extensions: { code: response.code, errors: response?.errors ?? [] },
    });
  }
}
