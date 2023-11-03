import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { isRunningOnLocal } from '../utils/isRunningOnLocal.ts';
import { getEnv } from '../utils/load-dot-env-file.ts';
import { resourceName } from '../utils/resourceName.ts';

// https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
// Amazon S3 website endpoints do not support HTTPS. If you want to use HTTPS, you can use Amazon CloudFront to serve a static website hosted on Amazon S3.
export function createCloudFront(bucket: aws.s3.BucketV2) {
  if (isRunningOnLocal()) {
    return {
      domainName: pulumi.Output.create(
        `localhost:${getEnv('WEB_DEV_SERVER_PORT')}`,
      ),
    };
  }
  const originId = pulumi.interpolate`s3-origin-id-${bucket.id}`;
  const cloudFrontDistribution = new aws.cloudfront.Distribution(
    resourceName`cloudfront-distribution`,
    {
      customErrorResponses: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultCacheBehavior: {
        allowedMethods: [
          'DELETE',
          'GET',
          'HEAD',
          'OPTIONS',
          'PATCH',
          'POST',
          'PUT',
        ],
        cachedMethods: ['GET', 'HEAD'],
        defaultTtl: 3600,
        forwardedValues: {
          cookies: {
            forward: 'all',
          },
          queryString: true,
        },
        maxTtl: 86400,
        minTtl: 0,
        targetOriginId: originId,
        viewerProtocolPolicy: 'allow-all',
      },
      defaultRootObject: 'index.html',
      enabled: true,

      isIpv6Enabled: true,
      origins: [
        {
          domainName: bucket.bucketRegionalDomainName,
          originId: originId,
        },
      ],
      priceClass: 'PriceClass_100',
      restrictions: {
        geoRestriction: {
          restrictionType: 'none',
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
    },
  );
  return {
    domainName: cloudFrontDistribution.domainName,
  };
}
