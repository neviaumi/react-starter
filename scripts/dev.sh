#!/usr/bin/env bash

set -ex

docker compose up -d
npx lerna exec --stream \
--scope 'infrastructure' \
-- "test ! -f  scripts/dev-deploy.sh || bash \
                                scripts/dev-deploy.sh"

npx lerna exec --stream \
--scope 'api' --scope 'web' \
-- "test ! -f  scripts/dev-server.sh || bash \
                                scripts/dev-server.sh"