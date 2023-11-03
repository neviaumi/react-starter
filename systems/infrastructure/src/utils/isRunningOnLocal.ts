import * as pulumi from '@pulumi/pulumi';

export function isRunningOnLocal() {
  return pulumi.getStack() === 'local';
}
