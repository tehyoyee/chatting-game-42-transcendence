OS=$(uname -s)
if [ "$OS" = "Darwin" ]
then
	open -g -a Docker
elif [ "$OS" = "Linux" ]
then
	echo "Please execute docker manually."
	exit 1
else
	echo "Please execute docker manually."
	exit 1
fi
