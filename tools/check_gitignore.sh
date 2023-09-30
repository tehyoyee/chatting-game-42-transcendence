COLOR_OFF='\033[0m'       # Text Reset
COLOR_BLACK='\033[0;30m'        # Black
COLOR_RED='\033[0;31m'        # Red
COLOR_GREEN='\033[0;32m'        # Green

ls .gitignore &> /dev/null
EXIST=$?
PATTERN=0
if [ $EXIST -eq 0 ]
then
	echo "^*?.env pattern in .gitignore"
	echo ""
	cat .gitignore | grep -n -e '^*\?.env$'
	PATTERN=$?
	if [ $PATTERN -eq 0 ]
	then
		printf "${COLOR_GREEN}.gitignore is good${COLOR_OFF}\n"
		exit 0
	else
		printf "\n${COLOR_RED}WARNING)\n"
		printf "${COLOR_RED}WARNING) .gitignore file doesn't include '.env' pattern.\n"
		printf "${COLOR_RED}WARNING)\n\n${COLOR_OFF}"
	fi
else
	printf "${COLOR_RED}WARNING)\n"
	printf "${COLOR_RED}WARNING) .gitignore file doesn't exists.\n"
	printf "${COLOR_RED}WARNING)\n\n${COLOR_OFF}"
fi

if [ $PATTERN -ne 0 ]
then
	echo ".env" >> .gitignore
	RET=$?
	if [ $RET -eq 0 ]
	then
		echo ".env pattern has been added to .gitignore file and staged for commit."
		exit 0
	else
		echo "appending '.env' pattern to .gitignore failed."
	fi
fi

read -p "continue to .gitignore file generation to prevent uploading sensitive files. (y/n) " RES

if [ $RES != "y" ]
then
	exit 0
fi

ENV_CONTENT="
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
node_modules
*/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

postgres-data
.env"

echo "$ENV_CONTENT" > .gitignore
ls .gitignore &> /dev/null
RET=$?
git add .gitignore
RET2=$?
if [[ $RET -eq 0 && $RET2 -eq 0 ]]
then
	echo ".gitignore file has been created and staged for commit."
	exit 0
elif [ $RET -eq 0 ]
then
	echo ".gitignore file is not staged. exiting..."
	exit 1
else 
	echo ".gitignore file is not created. exiting..."
	exit 1
fi
