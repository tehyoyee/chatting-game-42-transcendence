envsubst < .env_temp > .env
exec npm run dev -- -H "0.0.0.0" -p ${FRONTEND_PORT}
