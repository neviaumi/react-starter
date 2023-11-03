#!/bin/bash

set -ex
STACK=$1
SCRIPT_LOCATION=$(dirname $(pwd)/${BASH_SOURCE[0]})
WORK_SPACE_ROOT=$(realpath "$SCRIPT_LOCATION"/../../../..)
npm run build
STATE_STORE_BUCKET=$(node ./bin/setup-state-store.js infrastructure-as-code-state-store)
pulumi login "s3://$STATE_STORE_BUCKET"

PULUMI_CONFIG_PASSPHRASE= pulumi stack select organization/project-bootstrap/$STACK
PULUMI_CONFIG_PASSPHRASE= pulumi stack output --shell > "$WORK_SPACE_ROOT"/.env
cat "$WORK_SPACE_ROOT"/.env.tmp >> "$WORK_SPACE_ROOT"/.env