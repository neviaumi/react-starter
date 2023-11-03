#!/bin/env bash
aws --endpoint-url http://localhost:4566 s3api create-bucket --bucket infrastructure-as-code-state-store-local