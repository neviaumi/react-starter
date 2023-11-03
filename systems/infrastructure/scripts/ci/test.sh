#!/bin/sh

set -ex

npx eslint .
npx tsc
npm run build
STACK=preview
set +e
PULUMI_CONFIG_PASSPHRASE= pulumi stack init organization/project-bootstrap/$STACK
set -e
PULUMI_CONFIG_PASSPHRASE= pulumi stack select organization/project-bootstrap/$STACK
PULUMI_CONFIG_PASSPHRASE= pulumi preview --policy-pack ./bin/aws-guard
