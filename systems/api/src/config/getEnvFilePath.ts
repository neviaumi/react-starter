import path from 'node:path';

import { AppEnvironment } from './config.constants';

const projectRoot = path.join(__dirname, '../../../..');

export function getEnvFilePath() {
  const apiEnv = process.env['API_ENV'] ?? AppEnvironment.DEV;
  if (apiEnv === AppEnvironment.DEV) {
    return path.join(projectRoot, '.env');
  }

  if (apiEnv === AppEnvironment.TEST) {
    return path.join(projectRoot, '.env');
  }

  return path.join(projectRoot, '.env');
}
