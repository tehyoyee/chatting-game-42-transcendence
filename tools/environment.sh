COLOR_OFF='\033[0m'       # Text Reset
COLOR_BLACK='\033[0;30m'        # Black
COLOR_RED='\033[0;31m'        # Red
COLOR_GREEN='\033[0;32m'        # Green
COLOR_LGREEN='\033[1;32m'        # Light Green

FRONTEND_RUN='start'
BACKEND_RUN='start'
read -p "run as development mode (y/n) " DEV_RES
if [ "$DEV_RES" = "y" ]
then
	FRONTEND_RUN='dev'
	BACKEND_RUN='start:dev'
fi

ls .env &> /dev/null
RET=$?
RES="n"
if [ $RET -eq 0 ]
then
	source .env
	printf "${COLOR_RED}.env file exists.\n${COLOR_OFF}current content\n"
	echo ""
	printf "\"${COLOR_LGREEN}$SERVICE_ADDR${COLOR_OFF}\" - Address\n"
	printf "\"${COLOR_LGREEN}$CLIENT_ID${COLOR_OFF}\" - Client ID\n"
	printf "\"${COLOR_LGREEN}$CLIENT_SECRET${COLOR_OFF}\" - Client Secret\n"
	printf "\"${COLOR_LGREEN}$AUTH_URL${COLOR_OFF}\" - Authentication URL\n"
	printf "\n";
	printf "\"${COLOR_LGREEN}$POSTGRES_USER${COLOR_OFF}\" - Postgres User ID\n"
	printf "\"${COLOR_LGREEN}$POSTGRES_PASSWORD${COLOR_OFF}\" - Postgre User Password\n"
	printf "\"${COLOR_LGREEN}$MAIL_USER${COLOR_OFF}\" - 2FA ID\n"
	printf "\"${COLOR_LGREEN}$MAIL_PASSWORD${COLOR_OFF}\" - 2FA Password\n"
	printf "\"${COLOR_LGREEN}$JWT_SECRET${COLOR_OFF}\" - JWT Secret\n"
	echo ""
	read -p "Do you want to remove .env and generate new .env? (y/n) " RES
else
	echo "'.env' doesn't exists."
	echo ""
	read -p "Do you want to generate .env? (y/n) " RES
fi

RETRY=1
while [ $RETRY -eq 1 ]
do
	if [ "$RES" = "" ] || [ "$RES" = "y" ]
	then
		read -p "if you want to import .env, enter its path or just press enter to skip.: " IMPORT_RES
		if [ "$IMPORT_RES" = "" ]
		then
			echo "prepare address, client id, client secret, authentication URL, Postgres User ID, Password, 2FA ID, Password, JWT Secret." 
			read -p "Address: " SERVICE_ADDR
			read -p "Client id: " CLIENT_ID
			read -p "Client secret: " CLIENT_SECRET
			read -p "Authentication URL: " AUTH_URL

			read -p "Postgres User ID: " POSTGRES_USER
			read -p "Postgres User Password: " POSTGRES_PASSWORD
			read -p "2FA ID: " MAIL_USER
			read -p "2FA Password: " MAIL_PASSWORD
			read -p "JWT Secret: " JWT_SECRET
		else
			source $IMPORT_RES
		fi
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
	BACKEND_PORT=\"3000\"

	# certificates
	CLIENT_ID='$CLIENT_ID'
	CLIENT_SECRET='$CLIENT_SECRET'
	REDIRECT_URI='http://$SERVICE_ADDR:3001/auth'
	AUTH_URL='$AUTH_URL'

	# RUN MODE
	FRONTEND_RUN='$FRONTEND_RUN'
	BACKEND_RUN='$BACKEND_RUN'

	# POSTGRESQL
	POSTGRES_VERSION=15.4
	POSTGRES_HOST=\"postgres\" # container service name
	POSTGRES_PORT=\"5432\"
	POSTGRES_DB=\"chat-app\"
	POSTGRES_USER=\"$POSTGRES_USER\"
	POSTGRES_PASSWORD=\"$POSTGRES_PASSWORD\"

	# MAIL
	MAIL_USER='$MAIL_USER'
	MAIL_PASSWORD='$MAIL_PASSWORD'

	# JWT
	JWT_SECRET=\"$JWT_SECRET\"
	JWT_EXPIRES_IN=\"1d\"
	"

	echo "$ENV_CONTENT" > .env
	echo ""
	echo ".env file created."
	echo ""
	cat .env
	read -p "press enter to continue. enter any characters to try again. " EXIT_RES
	if [ "$EXIT_RES" = "" ]
	then
		exit 0
	fi
done

#printf "\"${COLOR_LGREEN}$SERVICE_ADDR${COLOR_OFF}\" - Address\n"
#printf "\"${COLOR_LGREEN}$CLIENT_ID${COLOR_OFF}\" - Client ID\n"
#printf "\"${COLOR_LGREEN}$CLIENT_SECRET${COLOR_OFF}\" - Client Secret\n"
#printf "\"${COLOR_LGREEN}$AUTH_URL${COLOR_OFF}\" - Authentication URL\n"
#printf "\n"
#printf "\"${COLOR_LGREEN}$POSTGRES_USER${COLOR_OFF}\" - Postgres User ID\n"
#printf "\"${COLOR_LGREEN}$POSTGRES_PASSWORD${COLOR_OFF}\" - Postgre User Password\n"
#printf "\"${COLOR_LGREEN}$MAIL_USER${COLOR_OFF}\" - 2FA ID\n"
#printf "\"${COLOR_LGREEN}$MAIL_PASSWORD${COLOR_OFF}\" - 2FA Password\n"
#printf "\"${COLOR_LGREEN}$JWT_SECRET${COLOR_OFF}\" - JWT Secret\n"
