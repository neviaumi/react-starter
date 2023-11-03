import { dirname, join } from 'node:path';

import { config } from 'dotenv';

const rootDir = new URL(dirname(import.meta.url)).pathname;
const projectRoot = join(rootDir, '../../../..');

const parsedEnv = config({ path: join(projectRoot, '.env.tmp') });
if (parsedEnv.error || !parsedEnv.parsed) {
  throw new Error('Failed to load .env file');
}

export function getEnv(key: 'API_PORT' | 'WEB_DEV_SERVER_PORT'): string {
  const value = parsedEnv.parsed![key]!;
  return value;
}
