import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser'; // cookie-parser REF-https://docs.nestjs.com/techniques/cookies
import { HttpExceptionFilter } from './auth/http.exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: `http://10.18.229.228:${process.env.FRONT_PORT || 3001}`,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH']
  })
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
