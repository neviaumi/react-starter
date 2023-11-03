import * as aws from '@pulumi/aws';

import { isRunningOnLocal } from '../utils/isRunningOnLocal.ts';
import { resourceName } from '../utils/resourceName.ts';
import { valueNa } from '../utils/value-na.ts';

export function createDynamoDb() {
  const gameTableArgs: aws.dynamodb.TableArgs = {
    attributes: [
      {
        name: 'GameId',
        type: 'S',
      },
    ],
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'GameId',
  };
  const mainTable = new aws.dynamodb.Table(resourceName`Game`, gameTableArgs);

  if (!isRunningOnLocal()) {
    return {
      mainTable: {
        name: mainTable.name,
      },
      seedTable: {
        name: valueNa,
      },
      testTable: {
        name: valueNa,
      },
    };
  }
  const seedTable = new aws.dynamodb.Table(resourceName`seeds`, {
    attributes: [
      {
        name: 'SeedName',
        type: 'S',
      },
      {
        name: 'SeededAtTimestamp',
        type: 'N',
      },
    ],
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'SeedName',
    rangeKey: 'SeededAtTimestamp',
  });
  const testTable = new aws.dynamodb.Table(
    resourceName`game-test`,
    gameTableArgs,
  );
  return {
    mainTable: {
      name: mainTable.name,
    },
    seedTable: {
      name: seedTable.name,
    },
    testTable: {
      name: testTable.name,
    },
  };
}
