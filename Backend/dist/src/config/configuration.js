"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    db: {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        user: process.env.DB_USER ?? 'dpscheck',
        password: process.env.DB_PASSWORD ?? 'dpscheck_dev_pwd',
        name: process.env.DB_NAME ?? 'dpscheck',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? 'insecure_default_do_not_use_in_prod',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
    },
});
//# sourceMappingURL=configuration.js.map