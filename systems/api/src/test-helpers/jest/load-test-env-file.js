const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('node:path');

const projectRoot = path.join(__dirname, '../../../../..');

module.exports = {
  getEnvOrThrow(key) {
    const allowedKeys = ['API_TEST_DB_GAME_TABLE_NAME'];
    if (!allowedKeys.includes(key)) {
      throw new Error(`Invalid environment variable: ${key}`);
    }
    const envValue = process.env[key];
    if (!envValue) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return process.env[key];
  },
  loadTestEnvFile() {
    const parsed = dotenv.config({ path: path.join(projectRoot, '.env') });
    dotenvExpand.expand(parsed);
  },
};
