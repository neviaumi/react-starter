#!/bin/sh

set -ex

#npx eslint --resolve-plugins-relative-to ./node_modules/@busybox/eslint-config .
npx eslint .
npx tsc
npx cypress run --component -b chrome