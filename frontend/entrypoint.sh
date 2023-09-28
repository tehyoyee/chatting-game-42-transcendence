envsubst < .env_temp > .env

npm run build
#service ssh
exec npm run dev -- -H "0.0.0.0" -p ${FRONTEND_PORT}
