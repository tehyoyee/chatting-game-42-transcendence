envsubst < .env_temp > .env

npm run build
#service ssh
exec npm run ${FRONTEND_RUN} -- -H "0.0.0.0" -p ${FRONTEND_PORT}
