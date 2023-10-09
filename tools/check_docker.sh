docker ps &> /dev/null
RET=$?
if [ $RET -eq 1 ]
then
	echo "docker is starting..."
	bash tools/init_docker.sh
	if [ $? -ne 0 ]
	then
		exit 1
	fi
	COUNT=0
	while [ $RET -ne 0 ]
	do
		sleep 1
		docker ps &> /dev/null
		RET=$?
		case $COUNT in
			0)
				printf "waiting for docker to boot.  \r"
				;;
			1)
				printf "waiting for docker to boot.. \r"
				;;
			2)
				printf "waiting for docker to boot...\r"
				;;
		esac
		COUNT=$(((COUNT + 1) % 3))
	done
fi
echo "docker is running."
