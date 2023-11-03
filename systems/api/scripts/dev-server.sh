#!/bin/sh

set -e

npm run build
API_ENV=development node ./dist/seed.js up
npx rimraf dist
API_ENV=development npm run start:dev