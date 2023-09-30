COLOR_OFF='\033[0m'       # Text Reset
COLOR_BLACK='\033[0;30m'        # Black
COLOR_RED='\033[0;31m'        # Red
COLOR_GREEN='\033[0;32m'        # Green
COLOR_LGREEN='\033[1;32m'        # Light Green

RUN_MODE='start'
read -p "run as development mode (y/n) " DEV_RES
if [ "$DEV_RES" = "y" ]
then
RUN_MODE='dev'
fi

ls .env &> /dev/null
RET=$?
RES="n"
if [ $RET -eq 0 ]
then
	source .env
	printf "${COLOR_RED}.env file exists.\n${COLOR_OFF}"
	echo ""
	printf "\"${COLOR_LGREEN}$SERVICE_ADDR${COLOR_OFF}\" - Address\n"
	printf "\"${COLOR_LGREEN}$CLIENT_ID${COLOR_OFF}\" - Client ID\n"
	printf "\"${COLOR_LGREEN}$CLIENT_SECRET${COLOR_OFF}\" - Client Secret\n"
	printf "\"${COLOR_LGREEN}$AUTH_URL${COLOR_OFF}\" - Authentication URL\n"
	echo ""
	read -p "Do you want to generate new .env? (y/n) " RES
else
	echo "'.env' doesn't exists."
	echo ""
	read -p "Do you want to generate .env? (y/n) " RES
fi



if [ "$RES" = "" ] || [ "$RES" = "y" ]
then
	echo "prepare address, client id, client secret, authentication URL." 
	read -p "Address: " SERVICE_ADDR
	read -p "Client id: " CLIENT_ID
	read -p "Client secret: " CLIENT_SECRET
	read -p "Authentication URL: " AUTH_URL
else
	if [ $RET -eq 0 ]
	then
		echo "existing .env file will be used."
		exit 0
	else
		echo "there's no .env file. exiting..."
		exit 1
	fi
fi

ENV_CONTENT="
NODE_VERSION=18.17.0

# ADDRESSES
SERVICE_ADDR=\"$SERVICE_ADDR\"
SERVICE_URL=\"http://$SERVICE_ADDR\"
FRONTEND_PORT=\"3001\"
FRONTEND_DEBUG_PORT=\"3011\"
BACKEND_PORT=\"3000\"
BACKEND_DEBUG_PORT=\"3010\"

# certificates
CLIENT_ID='$CLIENT_ID'
CLIENT_SECRET='$CLIENT_SECRET'
REDIRECT_URI='http://$SERVICE_ADDR:3001/auth'
AUTH_URL='$AUTH_URL'

# RUN MODE
FRONTEND_RUN='$RUN_MODE'
BACKEND_RUN='$RUN_MODE'

# POSTGRESQL
POSTGRES_VERSION=15.4
POSTGRES_HOST=\"postgres\" # container service name
POSTGRES_PORT=\"5432\"
POSTGRES_DB=\"chat-app\"
POSTGRES_USER=\"postgres\"
POSTGRES_PASSWORD=\"1234\"

# MAIL
MAIL_USER='tehyoyee@gmail.com'
MAIL_PASS='icfdxuzxjlstesqx'

# JWT
JWT_SECRET=\"Secret12345\"
JWT_EXPIRES_IN=\"1d\"

# DEBUG
DEBUG_PASSWD=\"1234qwer!\"
"

echo ""
echo ".env file created."
echo ""
printf "\"${COLOR_LGREEN}$SERVICE_ADDR${COLOR_OFF}\" - Address\n"
printf "\"${COLOR_LGREEN}$CLIENT_ID${COLOR_OFF}\" - Client ID\n"
printf "\"${COLOR_LGREEN}$CLIENT_SECRET${COLOR_OFF}\" - Client Secret\n"
printf "\"${COLOR_LGREEN}$AUTH_URL${COLOR_OFF}\" - Authentication URL\n"

echo "$ENV_CONTENT" > .env
