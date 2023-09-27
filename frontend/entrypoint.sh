envsubst < .env > resource/.env
cd resource
exec npm run start -- -H ${SERVICE_ADDR} -p ${FRONTEND_PORT}
