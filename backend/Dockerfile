FROM node:18-alpine

RUN apk update && apk upgrade && apk add sh --no-cache --quiet

WORKDIR /app

RUN mkdir config/

# COPY ./package*.json ./config
COPY ./ .

RUN cd ./config && npm i -g @nestjs/cli
RUN npm i

CMD npm run start
# CMD npm run start:prod