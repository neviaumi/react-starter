import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { DateTime } from 'luxon';

import { ApolloException } from '../error-hanlding/apollo.exception';
import { ErrorCode } from '../error-hanlding/error-code.constant';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: unknown): Date {
    const luxonDate = DateTime.fromJSDate(new Date(value as number));
    if (!luxonDate.isValid) {
      throw new ApolloException({
        code: ErrorCode.ValidationError,
        errors: [
          {
            detail: 'Invalid Date on Input',
            title: 'Validation Error',
          },
        ],
      });
    }
    return luxonDate.toJSDate(); // value from the client
  }

  serialize(value: unknown): string {
    const isoDateString = DateTime.fromJSDate(value as Date).toISODate(); // value sent to the client
    if (!isoDateString) {
      throw new ApolloException({
        code: ErrorCode.ValidationError,
        errors: [
          {
            detail: 'Invalid Date on Response',
            title: 'Validation Error',
          },
        ],
      });
    }
    return isoDateString;
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return DateTime.fromISO(ast.value as string).toJSDate();
    }
    // @ts-expect-error default return null from NestJS Example
    return null;
  }
}
