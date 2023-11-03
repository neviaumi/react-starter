#!/usr/bin/env bash

set -ex
ENVIRONMENT=$1

if [ -z "$CI" ]; then
  # https://github.com/orgs/community/discussions/26560
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git config user.name "github-actions[bot]"
fi

# Disable the commit hook
export HUSKY=0
SCRIPT_LOCATION=$(dirname $(pwd)/${BASH_SOURCE[0]})
WORK_SPACE_ROOT=$(realpath "$SCRIPT_LOCATION"/../)
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" == "main" ]; then
  echo "With major version"
  RELEASE_VERSION=$(date +'%Y.%-m.%-d')
else
  echo "With alpha version"
  RELEASE_VERSION=$(date +"%Y.%-m.%-d-alpha.$(($(date +"%-H") + 1))%M")
fi
export RELEASE_BRANCH="release-$RELEASE_VERSION"
export RELEASE_VERSION=$RELEASE_VERSION
export CURRENT_BRANCH=$CURRENT_BRANCH
COMMIT_MESSAGE="release v$RELEASE_VERSION [skip ci]"
git switch -c "$RELEASE_BRANCH"
git push --set-upstream origin "$RELEASE_BRANCH"
npx lerna version --message "$COMMIT_MESSAGE" --yes $RELEASE_VERSION
npx lerna exec --stream \
--scope 'infrastructure' \
-- "bash scripts/ci/deploy.sh $ENVIRONMENT"

npx lerna exec --stream \
--scope 'infrastructure' \
-- "bash scripts/ci/export-environment.sh $ENVIRONMENT"

source $WORK_SPACE_ROOT/.env

export DOCKER_IMAGE_REPO=$DOCKER_IMAGE_REPO
export API_DOCKER_IMAGE=$API_DOCKER_IMAGE
export API_LAMBDA_FUNCTION_ARN=$API_LAMBDA_FUNCTION_ARN
export API_LAMBDA_FUNCTION_LATEST_VERSION_ALIAS_ARN=$API_LAMBDA_FUNCTION_LATEST_VERSION_ALIAS_ARN
export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION
export WEB_S3_BUCKET=$WEB_S3_BUCKET

npx lerna exec --stream \
--scope 'api' \
-- "bash scripts/ci/deploy.sh"

npx lerna exec --stream \
--scope 'web' \
-- "bash scripts/ci/deploy.sh"