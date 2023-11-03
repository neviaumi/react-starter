/* eslint-disable no-console */

const { TestEnvironment } = require('jest-environment-node');
const {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');
const { getEnvOrThrow, loadTestEnvFile } = require('./load-test-env-file');

loadTestEnvFile();

function getWorkerId() {
  return process.env['JEST_WORKER_ID'];
}

class E2ETestEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testPath = context['testPath'];
    this.dynamoDBClient = new DynamoDBClient({
      endpoint: 'http://localhost:4566',
    });
  }

  get testTableName() {
    return `${getEnvOrThrow('API_TEST_DB_GAME_TABLE_NAME')}-${getWorkerId()}`;
  }

  async setupDB() {
    const client = this.dynamoDBClient;

    const testTableName = this.testTableName;

    const { Table: testGameTableDefinition } = await client.send(
      new DescribeTableCommand({
        TableName: getEnvOrThrow('API_TEST_DB_GAME_TABLE_NAME'),
      }),
    );

    const createTableCommandInput = {
      AttributeDefinitions: testGameTableDefinition.AttributeDefinitions,
      BillingMode: 'PAY_PER_REQUEST',
      DeletionProtectionEnabled: false,
      KeySchema: testGameTableDefinition.KeySchema,
      TableName: testTableName,
    };
    await client.send(new CreateTableCommand(createTableCommandInput));
    console.log(`DynamoDB table created: ${testTableName}`);
    return createTableCommandInput.TableName;
  }

  async setup() {
    this.global['testConfig'] = {
      db: {
        gameTable: await this.setupDB(),
      },
    };
    await super.setup();
  }

  async teardown() {
    const client = this.dynamoDBClient;
    await client.send(
      new DeleteTableCommand({
        TableName: this.testTableName,
      }),
    );
    this.global['testConfig'] = {};
    console.log(`DynamoDB table deleted: ${this.testTableName}`);
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = E2ETestEnvironment;
