read -p "input client secret: " SECRET
read -p "input client id: " CID
read -p "input callback url: " CALLBACK

echo "secret=\"${SECRET}\""
echo "cid=\"${CID}\""
echo "callbackurl=\"${CALLBACK}\""

read -p "
proceed to config creation? (y/n) " RES

if [ "$RES" != "" ] && [ $RESPONSE != "y" ]
then
	exit 0
fi

echo 123
