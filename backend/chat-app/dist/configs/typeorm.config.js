"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeORMConfig = void 0;
const config = require("config");
const dbconfig = config.get('db');
exports.typeORMConfig = {
    type: dbconfig.type,
    host: process.env.RDS_HOSTNAME || dbconfig.host,
    port: process.env.RDS_PORT || dbconfig.port,
    username: process.env.RDS_USERNAME || dbconfig.username,
    password: process.env.RDS_PASSWORD || dbconfig.password,
    database: process.env.RDS_DB_NAME || dbconfig.database,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: dbconfig.synchronize
};
//# sourceMappingURL=typeorm.config.js.map