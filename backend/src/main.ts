import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser'; // cookie-parser REF-https://docs.nestjs.com/techniques/cookies
import * as serverConfig from 'config';
import { HttpExceptionFilter } from './exception/http.exception.filter';
import { Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  console.log(process.env.FRONT_URL);
  app.enableCors({
    //    origin: `http://localhost:${process.env.FRONT_PORT || 3001}`,
    origin: `${serverConfig.get('server.url')}:${
      serverConfig.get('server.front_port') || 3001
    }`,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('jiwkwon')
    .setDescription('user API description')
    .setVersion('1.0.0')
    .addTag('user')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  Logger.debug(`Listening on Port ${port}`);
}

bootstrap();
