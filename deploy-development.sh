#!/bin/bash

docker login -u "transgo" -p "u4JTypz(E5J(Mj."
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker build -t api:backend-api-dev . -f Dockerfile.development
docker tag api:backend-api-dev transgo/api:backend-api-dev
docker push transgo/api:backend-api-dev