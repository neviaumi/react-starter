import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { isRunningOnLocal } from '../utils/isRunningOnLocal.ts';
import { getEnv } from '../utils/load-dot-env-file.ts';
import { resourceName } from '../utils/resourceName.ts';

export function createAPIGateWay({
  lambda,
  webHost,
}: {
  lambda: {
    invokeArn: pulumi.Output<string>;
    name: pulumi.Output<string>;
  };
  webHost: pulumi.Output<string>;
}) {
  if (isRunningOnLocal()) {
    return {
      apigw: {
        apiEndpoint: pulumi.Output.create(
          `http://localhost:${getEnv('API_PORT')}`,
        ),
      },
    };
  }
  new aws.lambda.Permission(
    resourceName`permission-for-connect-api-gateway-to-lambda`,
    {
      action: 'lambda:InvokeFunction',
      function: lambda.name,
      principal: 'apigateway.amazonaws.com',
    },
  );

  // Set up the API Gateway
  const apigw = new aws.apigatewayv2.Api(resourceName`ApiGateway`, {
    corsConfiguration: {
      allowCredentials: true,
      allowHeaders: ['Content-Type'],
      allowMethods: ['*'],
      allowOrigins: [webHost],
    },
    protocolType: 'HTTP',
    routeKey: '$default',
    target: lambda.invokeArn,
  });
  return { apigw };
}
