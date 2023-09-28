FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --update gettext openssh

COPY ./package*.json .
RUN npm install

#RUN mkdir src		volume mount
#COPY ./src ./src
#COPY ./uploads ./uploads

RUN mkdir config
COPY ./config ./config_temp

COPY ./tsconfig.json .
COPY ./tools/entrypoint.sh .

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
