#!/bin/sh

adduser $DEBUG_USER <<EOF
$DEBUG_PASSWD
$DEBUG_PASSWD
EOF

envsubst < ./config_temp/default.yml > ./config/default.yml
envsubst < ./config_temp/development.yml > ./config/development.yml
cp ./config_temp/production.yml ./config/production.yml

rc-status
rc-service sshd start

exec npm run start;
