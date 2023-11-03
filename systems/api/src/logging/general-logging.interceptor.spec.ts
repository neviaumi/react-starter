import { randomUUID } from 'node:crypto';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  Controller,
  Get,
  INestApplication,
  LoggerService,
  Post,
} from '@nestjs/common';
import {
  Args,
  ArgsType,
  Field,
  ID,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import type { NestExpressApplication } from '@nestjs/platform-express';
import gql from 'graphql-tag';
import type { Mock } from 'jest-mock';

import { expectResponseCode } from '../test-helpers/expect-response-code';
import { getApolloServer } from '../test-helpers/get-apollo-server';
import { getRequestAgent } from '../test-helpers/get-request-agent';
import {
  startTestingServer,
  withNestModuleBuilderContext,
} from '../test-helpers/nest-app-context';

@ObjectType()
class TestModel {
  @Field(() => ID)
  id!: string;
}

@ArgsType()
class TestArgs {
  @Field(() => ID)
  testId!: string;
}

@Resolver(() => TestModel)
class TestResolver {
  @Query(() => TestModel)
  testQuery(@Args() testArgs: TestArgs) {
    return { id: testArgs.testId };
  }
}

@Controller('/test-case')
class TestController {
  @Post('/happy-endpoint')
  post() {
    return { data: { message: 'I am happy' } };
  }

  @Get('/happy-endpoint')
  get() {
    return { data: { message: 'I am happy' } };
  }
}

const moduleBuilderContext = withNestModuleBuilderContext({
  controllers: [TestController],
  imports: [],
  providers: [TestResolver],
});

describe('General logging interceptor', () => {
  let app: NestExpressApplication;
  let logger: LoggerService;
  beforeEach(async () => {
    const module = await moduleBuilderContext.moduleBuilder.compile();
    app = module.createNestApplication<NestExpressApplication>();
    logger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    };

    app.useLogger(logger);
    app.setViewEngine('hbs');

    await startTestingServer(app);
  });
  afterEach(async () => {
    await app?.close();
  });

  it('query graphql resolver', async () => {
    const server = getApolloServer(app);
    const UNDEFINED = gql`
      query Test($testId: ID!) {
        testQuery(testId: $testId) {
          id
        }
      }
    `;
    const resp = await server.executeOperation({
      query: UNDEFINED,
      variables: {
        testId: randomUUID(),
      },
    });
    expect(resp.data).toBeDefined();
    expect(logger.log).toHaveBeenCalled();
    const logFunction = logger.log as Mock;
    const interceptorCall = logFunction.mock.calls.find(
      call => call[2] === 'GeneralLoggingInterceptor',
    );
    expect(interceptorCall).toBeDefined();
    const [loggingParams] = interceptorCall ?? [];
    expect(loggingParams).toStrictEqual({
      duration: expect.any(Number),
      graphql: {
        args: {
          testId: expect.any(String),
        },
        info: expect.anything(),
        root: undefined,
      },
      http: {
        method: 'POST',
        params: expect.any(Object),
        query: expect.any(Object),
        referer: undefined,
        request_id: expect.any(String),
        status_code: 200,
        url: '/graphql',
        useragent: undefined,
      },
      message: 'Access Log',
    });
  });
  it('query rest endpoint', async () => {
    await getRequestAgent((app as INestApplication).getHttpServer())
      .get('/test-case/happy-endpoint')
      .expect(expectResponseCode({ expectedStatusCode: 200 }));
    expect(logger.log).toHaveBeenCalled();
    const logFunction = logger.log as Mock;
    const interceptorCall = logFunction.mock.calls.find(
      call => call[2] === 'GeneralLoggingInterceptor',
    );
    expect(interceptorCall).toBeDefined();
    const [loggingParams] = interceptorCall ?? [];
    expect(loggingParams).toStrictEqual({
      duration: expect.any(Number),
      http: {
        method: 'GET',
        params: {},
        query: {},
        referer: undefined,
        request_id: expect.any(String),
        status_code: 200,
        url: '/test-case/happy-endpoint',
        useragent: undefined,
      },
      message: 'Access Log',
    });
  });

  it('post to rest endpoint', async () => {
    await getRequestAgent((app as INestApplication).getHttpServer())
      .post('/test-case/happy-endpoint')
      .send({
        data: 'something',
      })
      .expect(expectResponseCode({ expectedStatusCode: 201 }));
    expect(logger.log).toHaveBeenCalled();
    const logFunction = logger.log as Mock;
    const interceptorCall = logFunction.mock.calls.find(
      call => call[2] === 'GeneralLoggingInterceptor',
    );
    expect(interceptorCall).toBeDefined();
    const [loggingParams] = interceptorCall ?? [];
    expect(loggingParams).toStrictEqual({
      duration: expect.any(Number),
      http: {
        method: 'POST',
        params: {},
        query: {},
        referer: undefined,
        request_id: expect.any(String),
        status_code: 201,
        url: '/test-case/happy-endpoint',
        useragent: undefined,
      },
      message: 'Access Log',
    });
  });
});
