import { Injectable, Logger } from '@nestjs/common';
import { splitEvery } from 'ramda';

import { ConfigService } from '../config/config.module';
import {
  AttributeValue,
  BatchWriteItemCommand,
  DatabaseConnection,
  DeleteItemCommand,
  ExecuteStatementCommand,
  ExecuteStatementCommandOutput,
  ExecuteStatementInput,
  FindInput,
  Item,
  PutItemCommand,
} from '../database/database.module';
import { ErrorCode } from '../error-hanlding/error-code.constant';
import { InternalServerErrorException } from '../error-hanlding/internal-server-error.exception';
import { NotFoundException } from '../error-hanlding/not-found.exception';
import type { ChangeObjectValueTypeToString } from '../types/change-object-value-type';
import type { Game } from './models/game.model';

type FindGameInput = FindInput<{
  platform?: string;
  userId: string;
}>;

type SaveGameInput = ChangeObjectValueTypeToString<
  Game,
  'createdAt' | 'releaseDate' | 'updatedAt' | 'boxArtImageUrl'
> & {
  userId: string;
};

@Injectable()
export class GameRepository {
  private logger = new Logger(GameRepository.name);

  constructor(
    private databaseConnection: DatabaseConnection,
    private config: ConfigService,
  ) {}

  get gameTableName() {
    return this.config.getOrThrow('database.gameTable');
  }

  delete(id: string) {
    return this.databaseConnection.execute(
      new DeleteItemCommand({
        Key: {
          GameId: { S: id },
        },
        TableName: this.gameTableName,
      }),
    );
  }

  transformDatabaseItem(item: Item): Game {
    return {
      boxArtImageUrl: item['BoxArtImageUrl']?.S ?? '',
      createdAt: new Date(item['CreatedAt']?.S ?? ''),
      genre: item['Genre']?.S ?? '',
      id: item['GameId']?.S ?? '',
      name: item['Name']?.S ?? '',
      numberOfPlayers: Number(item['NumberOfPlayers']?.N ?? ''),
      platform: item['Platform']?.S ?? '',
      publisher: item['Publisher']?.S ?? '',
      releaseDate: new Date(item['ReleaseDate']?.S ?? ''),
      updatedAt: new Date(item['UpdatedAt']?.S ?? ''),
    };
  }

  private async findUntilReachingLimit(input: ExecuteStatementInput) {
    const resp = await this.databaseConnection.execute(
      new ExecuteStatementCommand(input),
    );
    if (!resp.Items)
      throw new InternalServerErrorException({
        code: ErrorCode.UnexpectedError,
        debugDetails: { ...input },
        errors: [{ title: 'Unexpected error when fetch Database' }],
      });
    const shouldFetchMore =
      input.Limit !== undefined &&
      resp.Items.length < input.Limit &&
      resp.NextToken !== undefined;
    if (shouldFetchMore) {
      const newFetchLimit = input.Limit! - resp.Items.length;
      const nextFetch: ExecuteStatementCommandOutput =
        await this.findUntilReachingLimit({
          ...input,
          Limit: newFetchLimit,
          NextToken: resp.NextToken,
        });
      const newItems = [...resp.Items, ...nextFetch.Items!];
      return {
        ...nextFetch,
        Items: newItems,
      };
    }
    return resp;
  }

  async find(args: FindGameInput) {
    type WhereQuery = {
      Parameter: AttributeValue;
      Statement: string;
    };
    const where: WhereQuery[] = [
      { Parameter: { S: args.where.userId }, Statement: `UserId = ?` },
      args.where.platform && {
        Parameter: { S: args.where.platform },
        Statement: `Platform = ?`,
      },
    ].filter(item => {
      return item !== undefined;
    }) as WhereQuery[];
    const executeStatementInput: ExecuteStatementInput = {
      Limit: args.limit,
      NextToken: args.nextPageToken,
      Parameters: where.map(item => item.Parameter),
      Statement: `SELECT * FROM "${this.gameTableName}" WHERE ${where
        .map(item => item.Statement)
        .join(' AND ')} `,
    };
    const resp = await this.findUntilReachingLimit(executeStatementInput);

    return {
      data: resp.Items!.map(this.transformDatabaseItem),
      nextPageToken: resp.NextToken,
    };
  }

  async findOne(id: string) {
    const resp = await this.databaseConnection.execute(
      new ExecuteStatementCommand({
        Parameters: [{ S: id }],
        // That would make global index less efficient, see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-indexes-general.html
        // If we want, we can reflect info apollo info object by graphql-fields link below.
        // https://github.com/robrichard/graphql-fields
        Statement: `SELECT * FROM "${this.gameTableName}" WHERE GameId = ?`,
      }),
    );

    if (!resp.Items) return undefined;
    return this.transformDatabaseItem(resp.Items[0]);
  }

  async findOneOrFail(id: string) {
    const data = await this.findOne(id);
    if (!data)
      throw new NotFoundException({
        code: ErrorCode.GameNotFoundError,
        errors: [{ title: 'Game not found error' }],
      });
    return data;
  }

  transformSaveGameInput(game: SaveGameInput) {
    return {
      BoxArtImageUrl: { S: game.boxArtImageUrl },
      CreatedAt: { S: game.createdAt },
      GameId: { S: game.id },
      Genre: { S: game.genre },
      Name: { S: game.name },
      NumberOfPlayers: { N: game.numberOfPlayers.toString() },
      Platform: { S: game.platform },
      Publisher: { S: game.publisher },
      ReleaseDate: { S: game.releaseDate },
      UpdatedAt: { S: game.updatedAt },
      UserId: { S: game.userId },
    };
  }

  async saveInBatch(batchOfGames: SaveGameInput[]) {
    const requestItems = splitEvery(25, batchOfGames).map(
      chunkOfBatchOfGames => {
        return {
          RequestItems: {
            [this.gameTableName]: chunkOfBatchOfGames.map(game => ({
              PutRequest: {
                Item: this.transformSaveGameInput(game),
              },
            })),
          },
        };
      },
    );
    for (const requestItem of requestItems) {
      await this.databaseConnection.execute(
        new BatchWriteItemCommand(requestItem),
      );
    }
    return requestItems
      .map(item =>
        item.RequestItems[this.gameTableName].map(item => item.PutRequest.Item),
      )
      .flat();
  }

  async save(game: SaveGameInput) {
    const transformedSaveGameInput = this.transformSaveGameInput(game);
    this.logger.debug({ game, message: 'save game', transformedSaveGameInput });
    await this.databaseConnection.execute(
      new PutItemCommand({
        Item: transformedSaveGameInput,
        TableName: this.gameTableName,
      }),
    );
    return game;
  }
}
