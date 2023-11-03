#!/bin/sh

set -ex

curl -fsSL https://get.pulumi.com | sh
npm ci
