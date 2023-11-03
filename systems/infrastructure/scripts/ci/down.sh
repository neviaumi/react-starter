#!/bin/bash

set -ex
STACK=$1
npm run build
STATE_STORE_BUCKET=$(node ./bin/setup-state-store.js infrastructure-as-code-state-store)
pulumi login "s3://$STATE_STORE_BUCKET"

set +e
PULUMI_CONFIG_PASSPHRASE= pulumi stack init organization/project-bootstrap/$STACK
set -e
PULUMI_CONFIG_PASSPHRASE= pulumi stack select organization/project-bootstrap/$STACK
PULUMI_CONFIG_PASSPHRASE= pulumi down --yes
