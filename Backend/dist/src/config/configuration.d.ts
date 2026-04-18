export interface AppConfig {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    db: {
        host: string;
        port: number;
        user: string;
        password: string;
        name: string;
        synchronize: boolean;
        logging: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
}
declare const _default: () => AppConfig;
export default _default;
