/* eslint-disable no-console */

import {
  CreateBucketCommand,
  ListBucketsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';

const [bucketPrefix] = process.argv.slice(2);
const isDev = process.env['APP_ENV'] === 'development';
const region = process.env['AWS_DEFAULT_REGION'] || undefined;
const client = new S3Client(
  isDev
    ? {
        endpoint: 'http://localhost:4566',
        forcePathStyle: true,
        region: 'eu-west-2',
      }
    : { region },
);

const data = await client.send(new ListBucketsCommand({}));
const existingBucket = data.Buckets?.find(bucket =>
  bucket.Name?.startsWith(bucketPrefix),
);
const isBucketExists = existingBucket !== undefined;
if (isBucketExists) {
  console.log(existingBucket.Name);
} else {
  const bucketSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789')(
    6,
  ).toLowerCase();
  const bucketName = `${bucketPrefix}-${bucketSuffix}`;
  await client.send(
    new CreateBucketCommand({
      Bucket: bucketName,
    }),
  );
  console.log(bucketName);
}
