"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
var config_1 = require("@nestjs/config");
var zod_1 = require("zod");
var envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1),
    DATABASE_URL: zod_1.z.string().url(),
});
var _config = null;
function parseEnv() {
    if (_config)
        return _config;
    _config = envSchema.parse(process.env);
    return _config;
}
exports.appConfig = (0, config_1.registerAs)('app', function () { return parseEnv(); });
