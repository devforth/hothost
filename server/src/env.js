import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";

const env = {
    ENV: process.env.ENV || 'production',
    WEB_ADMIN_USERNAME: process.env.HOTHOST_WEB_ADMIN_USERNAME,
    WEB_ADMIN_PASSWORD: process.env.HOTHOST_WEB_ADMIN_PASSWORD,
    WEB_BASIC_PUBLIC_USERNAME: process.env.HOTHOST_WEB_BASIC_PUBLIC_USERNAME,
    WEB_BASIC_PUBLIC_PASSWORD: process.env.HOTHOST_WEB_BASIC_PUBLIC_PASSWORD,
    WEB_PORT: +process.env.HOTHOST_WEB_PORT,
    WEB_JWT_SECRET: process.env.HOTHOST_WEB_JWT_SECRET,
};

env.DATA_PATH = env.ENV === 'local' ? './data/' : '/var/lib/hothost/data/';
env.THIRD_PARTY_PLUGINS_LOCATION = path.join(env.DATA_PATH, 'plugins');

if (env.ENV === 'production') {
    const requiredVariables = ['HOTHOST_WEB_ADMIN_USERNAME', 'HOTHOST_WEB_ADMIN_PASSWORD', 'HOTHOST_WEB_BASIC_PUBLIC_USERNAME', 'HOTHOST_WEB_BASIC_PUBLIC_PASSWORD'];
    requiredVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Environment variable '${key}' is missing`);
        }
    });

    if (!env.WEB_JWT_SECRET) {
        const jwtSecretPath = path.join('/var/lib/hothost/jwt');
        if (!fs.existsSync(jwtSecretPath)) {
            const jwtSecret = uuidv4();
            fs.writeFileSync(jwtSecretPath, jwtSecret);
        }
        env.WEB_JWT_SECRET = fs.readFileSync(jwtSecretPath);
    }
} else {
    if (!fs.existsSync(env.DATA_PATH)) {
        fs.mkdirSync(env.DATA_PATH);
    }
    env.WEB_ADMIN_USERNAME ||= 'admin';
    env.WEB_ADMIN_PASSWORD ||= '123456';
    env.WEB_BASIC_PUBLIC_USERNAME ||= 'admin';
    env.WEB_BASIC_PUBLIC_PASSWORD ||= '123456';
    env.WEB_PORT ||= '8007';
    env.WEB_JWT_SECRET ||= 'e10adc3949ba59abbe56e057f20f883e';
}
export default env;