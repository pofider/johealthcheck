#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t johealthcheck .
docker tag johealthcheck pofider/johealthcheck:$TRAVIS_TAG
docker push pofider/johealthcheck

git clone https://github.com/pofider/kubernetes.git
cd kubernetes
chmod +x push.sh
./push.sh "johealthcheck" "pofider/johealthcheck"