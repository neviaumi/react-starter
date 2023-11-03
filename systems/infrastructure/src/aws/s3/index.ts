import { promises as fs } from 'node:fs';
import path from 'node:path';

import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import Handlebars from 'handlebars';

import { isRunningOnLocal } from '../../utils/isRunningOnLocal.ts';
import { resourceName } from '../../utils/resourceName.ts';

const currentDir = path.parse(new URL(import.meta.url).pathname).dir;

export function createS3WebHostingBucket() {
  // Create an AWS resource (S3 Bucket)
  const bucket = new aws.s3.BucketV2(resourceName`web-hosting-bucket`, {
    forceDestroy: true,
  });
  const websiteConfig = new aws.s3.BucketWebsiteConfigurationV2(
    resourceName`bucket-website-config`,
    {
      bucket: bucket.id,
      indexDocument: {
        suffix: 'index.html',
      },
    },
  );
  const s3AccessBlock = new aws.s3.BucketPublicAccessBlock(
    resourceName`web-hosting-bucket-public-access-block`,
    {
      blockPublicAcls: false,
      blockPublicPolicy: false,
      bucket: bucket.id,
      ignorePublicAcls: false,
      restrictPublicBuckets: false,
    },
  );
  new aws.s3.BucketPolicy(
    resourceName`web-hosting-bucket-policy`,
    {
      bucket: bucket.id,
      policy: bucket.bucket.apply((bucketName: string) =>
        JSON.stringify({
          Statement: [
            {
              Action: ['s3:GetObject'],
              Effect: 'Allow',
              Principal: '*',
              Resource: [
                `arn:aws:s3:::${bucketName}/*`, // policy refers to bucket name explicitly
              ],
            },
          ],
          Version: '2012-10-17',
        }),
      ),
    },
    {
      dependsOn: [s3AccessBlock],
    },
  );

  return {
    bucket,
    websiteConfig,
  };
}

export function createS3AssetsBucket() {
  // Create an AWS resource (S3 Bucket)
  const bucket = new aws.s3.BucketV2(resourceName`assets-bucket`, {
    forceDestroy: true,
  });
  new aws.s3.BucketCorsConfigurationV2(resourceName`bucket-cors-config`, {
    bucket: bucket.id,
    corsRules: [
      {
        allowedHeaders: ['*'],
        allowedMethods: ['PUT'],
        allowedOrigins: ['*'],
        exposeHeaders: ['ETag'],
        maxAgeSeconds: 3000,
      },
    ],
  });
  const s3AccessBlock = new aws.s3.BucketPublicAccessBlock(
    resourceName`bucket-public-access-block`,
    {
      blockPublicAcls: false,
      blockPublicPolicy: false,
      bucket: bucket.id,
      ignorePublicAcls: false,
      restrictPublicBuckets: false,
    },
  );
  new aws.s3.BucketPolicy(
    resourceName`bucket-policy`,
    {
      bucket: bucket.id,
      policy: bucket.bucket.apply((bucketName: string) =>
        JSON.stringify({
          Statement: [
            {
              Action: ['s3:GetObject'],
              Effect: 'Allow',
              Principal: '*',
              Resource: [
                `arn:aws:s3:::${bucketName}/*`, // policy refers to bucket name explicitly
              ],
            },
          ],
          Version: '2012-10-17',
        }),
      ),
    },
    {
      dependsOn: [s3AccessBlock],
    },
  );

  new aws.s3.BucketObject(resourceName`demo-upload-image`, {
    bucket: bucket.id,
    contentType: 'image/gif',
    key: 'upload/demo.gif',
    source: new pulumi.asset.FileAsset(path.join(currentDir, 'demo.gif')),
  });
  return {
    bucket,
  };
}

export async function uploadTestIndexFile(
  bucket: aws.s3.BucketV2,
  api: { apiEndpoint: pulumi.Output<string> },
) {
  if (isRunningOnLocal()) {
    return null;
  }
  const template = Handlebars.compile(
    await fs.readFile(path.join(currentDir, 'index.hbs'), 'utf-8'),
  );

  return new aws.s3.BucketObject(resourceName`demo-index-html`, {
    bucket: bucket.id,
    content: api.apiEndpoint.apply(apiEndpoint =>
      template({ endpoint: apiEndpoint }),
    ),
    contentType: 'text/html',
    key: 'index.html',
  });
}
