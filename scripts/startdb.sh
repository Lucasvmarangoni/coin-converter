#!/bin/bash

DELAY=10

docker compose down
docker rm -f $(docker ps -a -q)
docker volume rm $(docker volume ls -q)

sleep 5

docker compose up -d

sleep 5

echo "Waiting for ${DELAY} seconds for containers to go up"
sleep $DELAY

docker compose exec mongo-primary /scripts/rs-init.sh
