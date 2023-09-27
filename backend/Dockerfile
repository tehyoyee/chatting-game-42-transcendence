FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./package*.json .
COPY ./tsconfig.json .
RUN mkdir src && mkdir config
COPY ./src ./src
COPY ./config ./config
COPY ./tools/entrypoint.sh .

RUN npm install
EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
