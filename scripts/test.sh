#! /usr/bin/env bash

set -ex

CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch is $CURRENT_BRANCH"
npx eslint .
npx cypress run --component -b chrome