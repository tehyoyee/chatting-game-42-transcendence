#!/bin/bash

COLOR_OFF='\033[0m'       # Text Reset
COLOR_BLACK='\033[0;30m'        # Black
COLOR_RED='\033[0;31m'        # Red
COLOR_GREEN='\033[0;32m'        # Green
COLOR_LGREEN='\033[1;32m'        # Light Green

check_ip_valid() {
	RET=0
	if [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]];
	then
		RET=1
	else
		echo "invalid IP Address(e.g 127.0.0.1): \"$1\""
	fi
	return $RET
}

ls .env &> /dev/null
RET=$?
RES="n"
if [ $RET -eq 0 ]
then
	source .env
	printf "\n${COLOR_RED}.env file exists.\n${COLOR_OFF}current content\n"
	echo ""
	printf "\"${COLOR_LGREEN}$SERVICE_ADDR${COLOR_OFF}\" - Address\n"
	printf "\"${COLOR_LGREEN}$OAUTH_CID${COLOR_OFF}\" - OAuth Client ID\n"
	printf "\"${COLOR_LGREEN}$OAUTH_SECRET${COLOR_OFF}\" - OAuth Client Secret\n"
	printf "\"${COLOR_LGREEN}$OAUTH_URL${COLOR_OFF}\" - OAuth Authentication URL\n"
	printf "\n";
	printf "\"${COLOR_LGREEN}$POSTGRES_USER${COLOR_OFF}\" - Postgres User ID\n"
	printf "\"${COLOR_LGREEN}$POSTGRES_PASSWORD${COLOR_OFF}\" - Postgre User Password\n"
	printf "\"${COLOR_LGREEN}$MAIL_USER${COLOR_OFF}\" - 2FA ID\n"
	printf "\"${COLOR_LGREEN}$MAIL_PASSWORD${COLOR_OFF}\" - 2FA Password\n"
	printf "\"${COLOR_LGREEN}$JWT_SECRET${COLOR_OFF}\" - JWT Secret\n"
	echo ""
	read -p "Do you want to remove current .env and generate new .env? (y/n) " RES
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
		STR="1) enter absolute path of .env to be imported.
2) press enter to manually set .env
$> "
		read -p "$STR" IMPORT_RES
		if [ "$IMPORT_RES" = "" ]
		then
			echo "prepare address, client id, client secret, authentication URL, Postgres User ID, Password, 2FA ID, Password, JWT Secret." 
			IP_VALID=0
			while [ $IP_VALID -eq 0 ]
			do
				read -p "IP Address: " SERVICE_ADDR
				check_ip_valid $SERVICE_ADDR
				IP_VALID=$?
			done
			read -p "OAuth Client id: " OAUTH_CID
			read -p "OAuth Client secret: " OAUTH_SECRET
			read -p "OAuth Authentication URL: " OAUTH_URL

			read -p "Postgres Host: " POSTGRES_HOST
			read -p "Postgres Port: " POSTGRES_PORT
			read -p "Postgres DB: " POSTGRES_DB
			read -p "Postgres User ID: " POSTGRES_USER
			read -p "Postgres User Password: " POSTGRES_PASSWORD

			read -p "2FA ID: " MAIL_USER
			read -p "2FA Password: " MAIL_PASSWORD
			read -p "JWT Secret: " JWT_SECRET
			read -p "JWT Expires in: " JWT_EXPIRES_IN
		else
			source "$IMPORT_RES"
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

	FRONTEND_RUN_OPT='start'
	BACKEND_RUN_OPT='start'
	read -p "run as development mode (y/n) " DEV_RES
	if [ "$DEV_RES" = "y" ]
	then
		FRONTEND_RUN_OPT='dev'
		BACKEND_RUN_OPT='start:dev'
	fi

	ENV_CONTENT="
NODE_VERSION=18.17.0

# ADDRESSES
SERVICE_ADDR=\"$SERVICE_ADDR\"
SERVICE_URL=\"http://$SERVICE_ADDR\"
FRONTEND_PORT=\"3001\"
BACKEND_PORT=\"3000\"

# certificates
OAUTH_CID='$OAUTH_CID'
OAUTH_SECRET='$OAUTH_SECRET'
REDIRECT_URI='http://$SERVICE_ADDR:3001/auth'
OAUTH_URL='$AUTH_URL'

# RUN MODE
FRONTEND_RUN='$FRONTEND_RUN_OPT'
BACKEND_RUN='$BACKEND_RUN_OPT'

# POSTGRESQL
POSTGRES_VERSION=15.4
POSTGRES_HOST=\"$POSTGRES_HOST\" # container service name
POSTGRES_PORT=\"$POSTGRES_PORT\"
POSTGRES_DB=\"$POSTGRES_DB\"
POSTGRES_USER=\"$POSTGRES_USER\"
POSTGRES_PASSWORD=\"$POSTGRES_PASSWORD\"

# MAIL
MAIL_USER='$MAIL_USER'
MAIL_PASSWORD='$MAIL_PASSWORD'

# JWT
JWT_SECRET=\"$JWT_SECRET\"
JWT_EXPIRES_IN=\"$JWT_EXPIRES_IN\""

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
#printf "\"${COLOR_LGREEN}$OAUTH_CID${COLOR_OFF}\" - Client ID\n"
#printf "\"${COLOR_LGREEN}$OAUTH_SECRET${COLOR_OFF}\" - Client Secret\n"
#printf "\"${COLOR_LGREEN}$OAUTH_URL${COLOR_OFF}\" - Authentication URL\n"
#printf "\n"
#printf "\"${COLOR_LGREEN}$POSTGRES_USER${COLOR_OFF}\" - Postgres User ID\n"
#printf "\"${COLOR_LGREEN}$POSTGRES_PASSWORD${COLOR_OFF}\" - Postgre User Password\n"
#printf "\"${COLOR_LGREEN}$MAIL_USER${COLOR_OFF}\" - 2FA ID\n"
#printf "\"${COLOR_LGREEN}$MAIL_PASSWORD${COLOR_OFF}\" - 2FA Password\n"
#printf "\"${COLOR_LGREEN}$JWT_SECRET${COLOR_OFF}\" - JWT Secret\n"
