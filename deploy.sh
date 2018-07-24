#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t jo-health-check .
docker tag janblaha pofider/jo-health-check:$TRAVIS_TAG
docker push pofider/jo-health-check

git clone https://github.com/pofider/kubernetes.git
cd kubernetes
chmod +x push.sh
./push.sh "jo" "pofider/jo-health-check"