#!/usr/bin/env bash

envsubst < .env_temp > .env

if [ "$FRONTEND_RUN" != "dev" ]
then
npm run build
fi
#service ssh
exec npm run ${FRONTEND_RUN} -- -H "0.0.0.0" -p ${FRONTEND_PORT}
