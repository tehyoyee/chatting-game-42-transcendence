#!/bin/sh

envsubst < ./config_temp/default.yml > ./config/default.yml
envsubst < ./config_temp/development.yml > ./config/development.yml
cp ./config_temp/production.yml ./config/production.yml

exec npm run start;