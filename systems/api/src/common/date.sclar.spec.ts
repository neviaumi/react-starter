import { describe, expect, it } from '@jest/globals';
import {
  Args,
  ArgsType,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { randomUUID } from 'crypto';
import gql from 'graphql-tag';

import { getApolloServer } from '../test-helpers/get-apollo-server';
import { getGraphqlErrorCodes } from '../test-helpers/get-graphql-error';
import { withNestServerContext } from '../test-helpers/nest-app-context';

@ObjectType()
class TestModel {
  @Field(() => ID)
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ArgsType()
class TestArgs {
  @Field({ nullable: false })
  createdAfter!: Date;
}

@InputType()
class TestInput {
  @Field({ nullable: false })
  createdAt!: Date;
}

@Resolver(() => TestModel)
class TestResolver {
  @Query(() => TestModel)
  testQueryWithoutDate(@Args() args: TestArgs) {
    return { args, id: randomUUID() };
  }

  @Query(() => TestModel)
  testQueryWithNullDate(@Args() args: TestArgs) {
    return { args, createdAt: null, id: randomUUID() };
  }

  @Query(() => TestModel)
  testQueryWithIncorrectDate(@Args() args: TestArgs) {
    return { args, createdAt: new Date('yyyy-mm-dd'), id: randomUUID() };
  }

  @Query(() => TestModel)
  testQuery(@Args() args: TestArgs) {
    return { args, createdAt: new Date(), id: randomUUID() };
  }

  @Mutation(() => TestModel)
  testMutation(@Args('data') data: TestInput) {
    return { data, id: randomUUID() };
  }
}

const appContext = withNestServerContext({
  controllers: [],
  imports: [],
  providers: [TestResolver],
});

describe('Date sclar', () => {
  describe('query', () => {
    it('call graphql query with incorrect date input', async () => {
      const app = appContext.app;
      const server = getApolloServer(app);
      const QUERY = gql`
        query Test($createdAfter: Date!) {
          testQuery(createdAfter: $createdAfter) {
            id
            createdAt
          }
        }
      `;
      const resp = await server.executeOperation({
        query: QUERY,
        variables: {
          createdAfter: 'abcd-99-99',
        },
      });
      expect(resp.errors).toBeDefined();
      expect(resp.errors).toStrictEqual([
        {
          extensions: {
            code: 'ERR_VALIDATION',
            errors: [
              {
                detail: 'Invalid Date on Input',
                title: 'Validation Error',
              },
            ],
          },
          locations: [
            {
              column: 12,
              line: 1,
            },
          ],
          message:
            'Variable "$createdAfter" got invalid value "abcd-99-99"; Graphql Error',
        },
      ]);
    });
    it('call graphql query with incorrect date response', async () => {
      const app = appContext.app;
      const server = getApolloServer(app);
      const QUERY = gql`
        query Test($createdAfter: Date!) {
          testQueryWithIncorrectDate(createdAfter: $createdAfter) {
            id
            createdAt
          }
        }
      `;
      const resp = await server.executeOperation({
        query: QUERY,
        variables: {
          createdAfter: '2023-11-02',
        },
      });
      expect(resp.errors).toBeDefined();
      expect(resp.errors).toStrictEqual([
        {
          extensions: {
            code: 'ERR_VALIDATION',
            errors: [
              {
                detail: 'Invalid Date on Response',
                title: 'Validation Error',
              },
            ],
          },
          locations: [
            {
              column: 5,
              line: 4,
            },
          ],
          message: 'Graphql Error',
          path: ['testQueryWithIncorrectDate', 'createdAt'],
        },
      ]);
    });
    it("empty date on response shouldn't cause any error", async () => {
      const app = appContext.app;
      const server = getApolloServer(app);
      const QUERY = gql`
        query Test($createdAfter: Date!) {
          testQueryWithNullDate(createdAfter: $createdAfter) {
            id
            createdAt
          }
          testQueryWithoutDate(createdAfter: $createdAfter) {
            id
            createdAt
          }
        }
      `;
      const resp = await server.executeOperation({
        query: QUERY,
        variables: {
          createdAfter: '2023-11-02',
        },
      });
      expect(resp.errors).toBeUndefined();
    });
  });
  describe('mutation', () => {
    it('call graphql mutation endpoint with incorrect date input', async () => {
      const app = appContext.app;
      const server = getApolloServer(app);
      const TEST_MUTATION = gql`
        mutation Test($data: TestInput!) {
          testMutation(data: $data) {
            id
          }
        }
      `;
      const resp = await server.executeOperation({
        query: TEST_MUTATION,
        variables: {
          data: {
            createdAt: 'abcd-99-99',
          },
        },
      });
      expect(resp.errors).toBeDefined();
      expect(getGraphqlErrorCodes(resp.errors)).toEqual(['ERR_VALIDATION']);
    });
  });
});
