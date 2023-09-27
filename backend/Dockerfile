FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --update gettext

COPY ./package*.json .

RUN npm install

COPY ./tsconfig.json .
RUN mkdir src && mkdir config
COPY ./src ./src
COPY ./config ./config_temp
COPY ./uploads ./uploads
COPY ./tools/entrypoint.sh .

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
