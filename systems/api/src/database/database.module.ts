import {
  AttributeValue,
  BatchExecuteStatementCommand,
  BatchExecuteStatementCommandOutput,
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  DeleteItemCommand,
  DeleteItemCommandOutput,
  DynamoDBClient,
  DynamoDBClientConfig,
  ExecuteStatementCommand,
  ExecuteStatementCommandOutput,
  ExecuteTransactionCommand,
  ExecuteTransactionCommandOutput,
  PutItemCommand,
  PutItemOutput,
  UpdateItemCommand,
  UpdateItemOutput,
} from '@aws-sdk/client-dynamodb';
import { Injectable, Module } from '@nestjs/common';
import { assocPath, pipe } from 'ramda';

import { AppEnvironment } from '../config/config.constants';
import { ConfigModule, ConfigService } from '../config/config.module';

function noOp() {
  return (value: unknown) => value;
}

export type {
  AttributeValue,
  ExecuteStatementCommandOutput,
  ExecuteStatementInput,
} from '@aws-sdk/client-dynamodb';
export {
  BatchExecuteStatementCommand,
  BatchWriteItemCommand,
  DeleteItemCommand,
  ExecuteStatementCommand,
  ExecuteTransactionCommand,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

export type FindInput<Where extends object> = {
  limit?: number;
  nextPageToken?: string;
  where: Where;
};

export type Item = Record<string, AttributeValue>;

@Injectable()
export class DatabaseConnection {
  private readonly client: DynamoDBClient;

  constructor(private config: ConfigService) {
    const env = this.config.get('env');
    const shouldUseLocalStack = [
      AppEnvironment.TEST,
      AppEnvironment.DEV,
    ].includes(env);
    const clientConfig: DynamoDBClientConfig = pipe(
      shouldUseLocalStack
        ? assocPath(['endpoint'], 'http://localhost:4566')
        : noOp,
      assocPath(['region'], config.getOrThrow('database.region')),
    )({} as any);
    this.client = new DynamoDBClient(clientConfig);
  }

  execute(command: PutItemCommand): Promise<PutItemOutput>;

  execute(command: BatchWriteItemCommand): Promise<BatchWriteItemCommandOutput>;

  execute(command: UpdateItemCommand): Promise<UpdateItemOutput>;

  execute(
    command: BatchExecuteStatementCommand,
  ): Promise<BatchExecuteStatementCommandOutput>;

  execute(
    command: ExecuteTransactionCommand,
  ): Promise<ExecuteTransactionCommandOutput>;

  execute(
    command: ExecuteStatementCommand,
  ): Promise<ExecuteStatementCommandOutput>;

  execute(command: DeleteItemCommand): Promise<DeleteItemCommandOutput>;

  execute(
    command:
      | PutItemCommand
      | UpdateItemCommand
      | BatchWriteItemCommand
      | BatchExecuteStatementCommand
      | ExecuteTransactionCommand
      | ExecuteStatementCommand
      | DeleteItemCommand,
  ): Promise<
    | PutItemOutput
    | UpdateItemOutput
    | BatchWriteItemCommandOutput
    | BatchExecuteStatementCommandOutput
    | ExecuteTransactionCommandOutput
    | ExecuteStatementCommandOutput
    | DeleteItemCommandOutput
  > {
    if (command instanceof PutItemCommand) {
      return this.client.send(command);
    } else if (command instanceof UpdateItemCommand) {
      return this.client.send(command);
    } else if (command instanceof BatchWriteItemCommand) {
      return this.client.send(command);
    } else if (command instanceof BatchExecuteStatementCommand) {
      return this.client.send(command);
    } else if (command instanceof ExecuteTransactionCommand) {
      return this.client.send(command);
    } else if (command instanceof ExecuteStatementCommand) {
      return this.client.send(command);
    } else if (command instanceof DeleteItemCommand) {
      return this.client.send(command);
    }
    throw new Error('Unknown command type.');
  }
}

@Module({
  exports: [DatabaseConnection],
  imports: [ConfigModule],
  providers: [DatabaseConnection],
})
export class DatabaseModule {}
