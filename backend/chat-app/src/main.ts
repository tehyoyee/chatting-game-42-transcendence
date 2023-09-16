import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser'; // cookie-parser REF-https://docs.nestjs.com/techniques/cookies

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: `http://localhost:${process.env.FRONT_PORT || 3001}`,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH']
  })
  app.use(cookieParser());
  
  const config = new DocumentBuilder()
    .setTitle('jiwkwon')
    .setDescription('user API description')
    .setVersion('1.0.0')
    .addTag('user')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`listening on port ${port}`);
}
bootstrap();
