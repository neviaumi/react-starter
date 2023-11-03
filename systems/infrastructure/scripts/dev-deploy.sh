#!/bin/sh

set -ex
SCRIPT_LOCATION=$(dirname $(pwd)/${BASH_SOURCE[0]})
WORK_SPACE_ROOT=$(realpath "$SCRIPT_LOCATION"/../../..)
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export APP_ENV=development
npm run build
STACK=local
STATE_STORE_BUCKET=$(node ./bin/setup-state-store.js infrastructure-as-code-state-store)
pulumi login "s3://$STATE_STORE_BUCKET?region=eu-west-2&endpoint=localhost:4566&disableSSL=true&s3ForcePathStyle=true"
set +e
PULUMI_CONFIG_PASSPHRASE= pulumi stack init organization/project-bootstrap/$STACK
set -e
PULUMI_CONFIG_PASSPHRASE= pulumi stack select organization/project-bootstrap/$STACK
PULUMI_CONFIG_PASSPHRASE= pulumi up --yes
PULUMI_CONFIG_PASSPHRASE= pulumi stack output --shell > "$WORK_SPACE_ROOT"/.env
cat "$WORK_SPACE_ROOT"/.env.tmp >> "$WORK_SPACE_ROOT"/.env