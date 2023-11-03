import convict from 'convict';
import { assocPath, dissocPath, path, pipe } from 'ramda';

import { Level } from '../logging/logging.constants';
import { AppEnvironment, AppMode } from './config.constants';

const NO_OP = (values: unknown) => values;
export function configuration(override?: {
  database?: {
    gameTable?: string;
  };
}) {
  const envSchema = convict({
    env: {
      default: 'development',
      env: 'API_ENV',
      format: Object.values(AppEnvironment),
    },
  });
  envSchema.validate({
    allowed: 'strict',
  });
  const env = envSchema.get('env');
  const configSchema = convict({
    // @ts-expect-error No type here
    database: {
      gameTable: pipe(
        env === AppEnvironment.TEST ? dissocPath(['env']) : NO_OP,
        env === AppEnvironment.TEST
          ? assocPath(['default'], path(['database', 'gameTable'], override))
          : NO_OP,
      )({
        default: null,
        env: 'API_DB_GAME_TABLE_NAME',
        format: String,
      }),
      region: {
        default: null,
        env: 'API_DB_REGION',
        format: String,
      },
      seedTable: {
        default: null,
        env: 'API_DB_SEED_TABLE_NAME',
        format: String,
      },
    },
    env: {
      default: env,
    },
    log: {
      level: {
        default: Level.info,
        env: 'API_LOG_LEVEL',
        format: Object.values(Level),
      },
    },
    mode: {
      default: 'http',
      env: 'API_MODE',
      format: Object.values(AppMode),
    },
    port: {
      default: 5333,
      env: 'API_PORT',
      format: 'port',
    },
    s3: {
      asset: {
        bucket: {
          default: null,
          env: 'API_S3_ASSET_BUCKET',
          format: String,
        },
        host: {
          default: null,
          env: 'API_S3_ASSET_HOST',
          format: String,
        },
        region: {
          default: null,
          env: 'API_S3_ASSET_REGION',
          format: String,
        },
      },
    },
    web: {
      host: {
        default: null,
        env: 'API_WEB_HOST',
        format: String,
      },
    },
  });

  configSchema.validate({
    allowed: 'strict',
  });

  return configSchema.getProperties();
}
