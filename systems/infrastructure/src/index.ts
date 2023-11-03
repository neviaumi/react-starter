import './utils/load-dot-env-file.ts';

import { getRegion } from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { createAPIGateWay } from './aws/api-gateway.ts';
import { createCloudFront } from './aws/cloudfront.ts';
import { createDynamoDb } from './aws/dynamodb.ts';
import { createECRImage } from './aws/ecr/index.ts';
import { createLambda } from './aws/lambda.ts';
import {
  createS3AssetsBucket,
  createS3WebHostingBucket,
  uploadTestIndexFile,
} from './aws/s3/index.ts';
import { isRunningOnLocal } from './utils/isRunningOnLocal.ts';

const region = await getRegion();
const { mainTable, seedTable, testTable } = createDynamoDb();
const { bucket: webBucket } = createS3WebHostingBucket();
const { bucket: assetsBucket } = createS3AssetsBucket();
const { domainName: frontendDomain } = createCloudFront(webBucket);
const { image } = createECRImage();
export const ASSETS_S3_BUCKET_HOST = pulumi
  .all([assetsBucket.bucket, assetsBucket.region])
  .apply(([bucket, region]) => {
    if (isRunningOnLocal()) {
      return `http://localhost:4566/${bucket}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com`;
  });
export const WEB_HOST = frontendDomain.apply(domainName =>
  isRunningOnLocal() ? `http://${domainName}` : `https://${domainName}`,
);
const { lambdaFunction, lambdaLatestVersionAlias } = createLambda(
  image.imageUri,
  {
    assetBucketName: assetsBucket.bucket,
    assetBucketRegion: assetsBucket.region,
    assetHost: ASSETS_S3_BUCKET_HOST,
    dynamodbGameTableName: mainTable.name,
    dynamodbRegion: region.name,
    dynamodbSeedTableName: seedTable.name,
    webHost: WEB_HOST,
  },
);
const { apigw } = createAPIGateWay({
  lambda: {
    invokeArn: lambdaFunction.invokeArn,
    name: lambdaFunction.name,
  },
  webHost: WEB_HOST,
});
await uploadTestIndexFile(webBucket, apigw);
export const DYNAMODB_GAME_TABLE_NAME = mainTable.name;
export const DYNAMODB_TEST_GAME_TABLE_NAME = testTable.name;
export const DYNAMODB_SEED_TABLE_NAME = seedTable.name;
export const AWS_REGION = region.name;

export const ASSETS_S3_REGION = assetsBucket.region;
export const ASSETS_S3_BUCKET = assetsBucket.bucket;

export const WEB_S3_BUCKET = webBucket.bucket;

export const API_HOST = apigw.apiEndpoint;
export const API_DOCKER_IMAGE = image.imageUri.apply(uri => uri.split(':')[0]);
export const DOCKER_IMAGE_REPO = API_DOCKER_IMAGE.apply(uri =>
  uri === 'N/A' ? uri : uri.split('/')[0],
);

export const API_LAMBDA_FUNCTION_ARN = lambdaFunction.arn;
export const API_LAMBDA_FUNCTION_LATEST_VERSION_ALIAS_ARN =
  lambdaLatestVersionAlias.name;
