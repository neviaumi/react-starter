#!/use/bin bash

set -ex
SCRIPT_LOCATION=$(dirname $(pwd)/${BASH_SOURCE[0]})
APP_ROOT=$(realpath "$SCRIPT_LOCATION"/../../)

docker_repo=${DOCKER_IMAGE_REPO}
api_docker_image=${API_DOCKER_IMAGE}
lambda_function_arn=${API_LAMBDA_FUNCTION_ARN}
lambda_function_latest_version_alias_name=${API_LAMBDA_FUNCTION_LATEST_VERSION_ALIAS_ARN}
aws_region=${AWS_DEFAULT_REGION}

tag=$(cat $APP_ROOT/package.json | jq -r '.version')

aws ecr get-login-password --region "$aws_region" | docker login --username AWS --password-stdin "$docker_repo"
docker build -t api:latest -t "api:$tag" -f ./Dockerfile.lambda .
docker tag  api:latest "$api_docker_image:latest"
docker tag  "api:$tag" "$api_docker_image:$tag"
docker push "$api_docker_image:latest"
docker push "$api_docker_image:$tag"
latest_version=$(aws lambda update-function-code \
    --function-name "$lambda_function_arn" \
    --image-uri "$api_docker_image:$tag" \
    --publish | jq -r '.Version')
aws lambda update-alias \
    --function-name "$lambda_function_arn" \
    --function-version "$latest_version" \
    --name "$lambda_function_latest_version_alias_name"
