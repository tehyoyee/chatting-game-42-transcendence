docker ps &> /dev/null
RET=$?
if [ $RET -eq 1 ]
then
	echo "docker is started."
	bash tools/init_docker.sh
	while [ $RET -ne 0 ]
	do
		sleep 2
		docker ps &> /dev/null
		RET=$?
		echo "waiting for docker to boot..."
	done
fi
echo "docker is running."
