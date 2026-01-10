"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = void 0;
const zod_1 = require("zod");
const token_1 = require("../../Utiles/security/token");
exports.logoutSchema = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(token_1.LogoutEnum).default(token_1.LogoutEnum.ONLY)
    })
};
