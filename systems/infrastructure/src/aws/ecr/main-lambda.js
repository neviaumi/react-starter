/* eslint-disable import/no-unresolved */

import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

export async function handler() {
  const client = new DynamoDBClient();
  const resp = await client.send(new ListTablesCommand({}));
  return { env: process.env, tables: resp.TableNames };
}
