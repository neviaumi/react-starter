#!/bin/bash

set -ex

s3_bucket=${WEB_S3_BUCKET}

npm run build
aws s3 cp --recursive dist "s3://$s3_bucket/"