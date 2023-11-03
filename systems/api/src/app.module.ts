import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import {
  HttpStatus,
  type MiddlewareConsumer,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

import { CommonModule } from './common/common.module';
import { RequestIdMiddleware } from './common/request-id.middleware';
import { RequestStartTimeMiddleware } from './common/request-start-time.middleware';
import { AppEnvironment } from './config/config.constants';
import { ConfigModule } from './config/config.module';
import { BadRequestException } from './error-hanlding/bad-request.exception';
import { ErrorCode } from './error-hanlding/error-code.constant';
import { GeneralExceptionFilter } from './error-hanlding/general-exception.filter';
import { GameGalleryModule } from './game-gallery/game-gallery.module';
import { HealthModule } from './health-check/health.module';
import { GeneralLoggingInterceptor } from './logging/general-logging.interceptor';
import { LoggingModule } from './logging/logging.module';
import { SeederModule } from './test-helpers/seeder/seeder.module';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot(),
    LoggingModule,
    CommonModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const shouldGenerateSchemaFile = [AppEnvironment.DEV].includes(
          configService.get('env')!,
        );
        return {
          autoSchemaFile: !shouldGenerateSchemaFile ? true : 'schema.graphql',
          autoTransformHttpErrors: true,
          context: ({ req, res }: { req: any; res: any }) => ({
            req,
            res,
          }),
          formatResponse(response: any, context: any) {
            return {
              ...response,
              http: {
                ...context.response?.http,
                status: HttpStatus.OK,
              } as any,
            };
          },
          sortSchema: true,
        };
      },
    }),
    GameGalleryModule,
    HealthModule,
    SeederModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GeneralExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GeneralLoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        exceptionFactory(errors) {
          throw new BadRequestException({
            code: ErrorCode.ValidationError,
            errors: errors.map(error => ({
              detail: error.toString(),
              title: 'Validation Error',
            })),
            meta: { errors },
          });
        },
        transform: true,
        whitelist: false,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestStartTimeMiddleware, RequestIdMiddleware)
      .forRoutes('*');
  }
}
