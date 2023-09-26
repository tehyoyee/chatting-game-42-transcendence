"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const serverConfig = require("config");
const http_exception_filter_1 = require("./exception/http.exception.filter");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = process.env.PORT || 3000;
    console.log(process.env.FRONT_URL);
    app.enableCors({
        origin: `${serverConfig.get('server.url')}:${serverConfig.get('server.front_port') || 3001}`,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH']
    });
    app.use(cookieParser());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('jiwkwon')
        .setDescription('user API description')
        .setVersion('1.0.0')
        .addTag('user')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(port);
    common_1.Logger.debug(`Listening on Port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map