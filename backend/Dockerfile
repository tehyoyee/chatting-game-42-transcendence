FROM node:18-alpine

RUN apk add --update gettext openrc openssh \
	&& ssh-keygen -A \
	&& rc-status \
	&& touch /run/openrc/softlevel

WORKDIR /usr/src/app

COPY ./package*.json .
COPY ./tsconfig.json .
COPY ./tools/entrypoint.sh .
RUN npm install

#RUN mkdir src		volume mount
#COPY ./src ./src
#COPY ./uploads ./uploads

RUN mkdir config
COPY ./config ./config_temp


EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
