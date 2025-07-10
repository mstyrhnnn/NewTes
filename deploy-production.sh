#!/bin/bash

docker login -u "transgo" -p "u4JTypz(E5J(Mj."
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker build -t api:backend-api-prod . -f Dockerfile.prod
docker tag api:backend-api-prod transgo/api:backend-api-prod
docker push transgo/api:backend-api-prod