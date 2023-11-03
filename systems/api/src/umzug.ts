import path from 'node:path';

import { NestFactory } from '@nestjs/core';
import { LogFn, MigrationParams, Umzug, UmzugStorage } from 'umzug';

import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from './config/config.module';
import {
  DatabaseConnection,
  DatabaseModule,
  DeleteItemCommand,
  ExecuteStatementCommand,
  PutItemCommand,
} from './database/database.module';
import { GameRepository } from './game-gallery/game.repository';
import { GameService } from './game-gallery/game.service';
import { GameGalleryModule } from './game-gallery/game-gallery.module';
import { Level } from './logging/logging.constants';
import { Logger, LoggingModule, NestLogger } from './logging/logging.module';

class DynamodbDbSeedStorage implements UmzugStorage {
  constructor(
    private readonly dbTableName: string,
    private readonly databaseConnection: DatabaseConnection,
  ) {}

  async executed() {
    const resp = await this.databaseConnection.execute(
      new ExecuteStatementCommand({
        Statement: `SELECT SeedName FROM "${this.dbTableName}"`,
      }),
    );
    return resp.Items!.map(item => item['SeedName'].S!);
  }

  async logMigration(params: MigrationParams<unknown>) {
    const now = new Date();
    await this.databaseConnection.execute(
      new PutItemCommand({
        Item: {
          SeedName: { S: params.name },
          SeededAtTimestamp: { N: String(now.getTime()) },
          SeededDateTime: { S: now.toISOString() },
        },
        TableName: this.dbTableName,
      }),
    );
  }

  async unlogMigration(params: MigrationParams<unknown>) {
    const resp = await this.databaseConnection.execute(
      new ExecuteStatementCommand({
        Parameters: [
          {
            S: params.name,
          },
        ],
        Statement: `SELECT SeedName, SeededAtTimestamp  FROM "${this.dbTableName}" WHERE SeedName = ?`,
      }),
    );
    const [item] = resp.Items!;
    await this.databaseConnection.execute(
      new DeleteItemCommand({
        Key: {
          SeedName: { S: item['SeedName'].S! },
          SeededAtTimestamp: { N: item['SeededAtTimestamp'].N! },
        },
        TableName: this.dbTableName,
      }),
    );
  }
}

type LogParams = Record<string, unknown>;

class UmzugLogger
  implements Record<'info' | 'warn' | 'error' | 'debug', LogFn>
{
  constructor(private readonly logger: Logger) {}

  debug(message: LogParams) {
    this.logger.log(Level.debug, '', message);
  }

  info(message: LogParams) {
    this.logger.log(Level.info, '', message);
  }

  warn(message: LogParams) {
    this.logger.log(Level.warn, '', message);
  }

  error(message: LogParams) {
    this.logger.log(Level.error, '', message);
  }
}

export type MigrationContext = {
  config: ConfigService;
  database: DatabaseConnection;
  gameRepository: GameRepository;
  gameService: GameService;
};

export async function setupSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  const nestLogger = app.select(LoggingModule).get(NestLogger);
  app.useLogger(nestLogger);

  const logger = app.select(LoggingModule).get(Logger);
  const gameRepository = app.select(GameGalleryModule).get(GameRepository);
  const gameService = app.select(GameGalleryModule).get(GameService);

  const configService = app
    .select(ConfigModule)
    .get(ConfigService, { strict: true });
  const databaseConnection = app
    .select(DatabaseModule)
    .get(DatabaseConnection, {
      strict: true,
    });
  return new Umzug<MigrationContext>({
    context: {
      config: configService,
      database: databaseConnection,
      gameRepository,
      gameService,
    },
    create: {
      folder: path.join(__dirname, '../src/seeders'),
      template: (filepath: string) => {
        return [
          [
            filepath,
            `import type { MigrationFn } from 'umzug';
import type { MigrationContext } from '../umzug';

export const up: MigrationFn<MigrationContext> = async ({context}) => {};
export const down: MigrationFn<MigrationContext> = async ({context}) => {};
`,
          ],
        ];
      },
    },
    logger: new UmzugLogger(logger),
    migrations: {
      glob: ['seeders/*.js', { cwd: __dirname }],
    },
    storage: new DynamodbDbSeedStorage(
      configService.getOrThrow('API_DB_SEED_TABLE_NAME'),
      databaseConnection,
    ),
  });
}
