import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { isRunningOnLocal } from '../utils/isRunningOnLocal.ts';
import { resourceName } from '../utils/resourceName.ts';
import { valueNa } from '../utils/value-na.ts';

export function createLambda(
  imageUri: pulumi.Output<string>,
  {
    assetBucketName,
    assetBucketRegion,
    assetHost,
    dynamodbGameTableName,
    dynamodbRegion,
    dynamodbSeedTableName,
    webHost,
  }: {
    assetBucketName: pulumi.Output<string>;
    assetBucketRegion: pulumi.Output<string>;
    assetHost: pulumi.Output<string>;
    dynamodbGameTableName: pulumi.Output<string>;
    dynamodbRegion: string;
    dynamodbSeedTableName: pulumi.Output<string>;
    webHost: pulumi.Output<string>;
  },
) {
  if (isRunningOnLocal()) {
    return {
      lambdaFunction: { arn: valueNa, invokeArn: valueNa, name: valueNa },
      lambdaLatestVersionAlias: { name: valueNa },
    };
  }
  const role = new aws.iam.Role(resourceName`role-lambda`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: 'lambda.amazonaws.com',
    }),
  });
  new aws.iam.RolePolicyAttachment(resourceName`role-policy-lambda`, {
    policyArn: aws.iam.ManagedPolicy.AWSLambdaExecute,
    role: role,
  });
  new aws.iam.RolePolicyAttachment(
    resourceName`role-policy-dynamodb-full-access`,
    {
      policyArn: aws.iam.ManagedPolicy.AmazonDynamoDBFullAccess,
      role: role,
    },
  );

  const lambdaFunction = new aws.lambda.Function(resourceName`lambda`, {
    environment: {
      variables: {
        API_DB_GAME_TABLE_NAME: dynamodbGameTableName,
        API_DB_REGION: dynamodbRegion,
        API_DB_SEED_TABLE_NAME: dynamodbSeedTableName,
        API_ENV: 'production',
        API_MODE: 'lambda',
        API_S3_ASSET_BUCKET: assetBucketName,
        API_S3_ASSET_HOST: assetHost,
        API_S3_ASSET_REGION: assetBucketRegion,
        API_WEB_HOST: webHost,
        NODE_ENV: 'production',
      },
    },
    imageConfig: {
      commands: ['main-lambda.handler'],
    },
    imageUri,
    packageType: 'Image',
    publish: true,
    role: role.arn,
    timeout: 60,
  });
  const lambdaLatestVersionAlias = new aws.lambda.Alias(
    `lambda-version-alias`,
    {
      functionName: lambdaFunction.arn,
      functionVersion: '1',
    },
  );
  new aws.lambda.ProvisionedConcurrencyConfig(`lambda-provision-config`, {
    functionName: lambdaLatestVersionAlias.functionName,
    provisionedConcurrentExecutions: 1,
    qualifier: lambdaLatestVersionAlias.name,
  });
  return { lambdaFunction, lambdaLatestVersionAlias };
}
