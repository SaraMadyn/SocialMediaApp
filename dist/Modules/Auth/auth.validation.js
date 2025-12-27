"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = exports.confirmEmailSchema = exports.loginSchema = void 0;
const z = __importStar(require("zod"));
const validation_middlewares_1 = require("../../Middlewares/validation.middlewares");
exports.loginSchema = {
    body: z.strictObject({
        email: validation_middlewares_1.generalFields.email,
        password: validation_middlewares_1.generalFields.password,
    })
};
exports.confirmEmailSchema = {
    body: z.strictObject({
        email: validation_middlewares_1.generalFields.email,
        otp: validation_middlewares_1.generalFields.otp,
    })
};
exports.signupSchema = {
    body: exports.loginSchema.body.extend({
        username: validation_middlewares_1.generalFields.username,
        confirmPassword: validation_middlewares_1.generalFields.confirmPassword,
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "password don't match",
            });
            if (data.username?.split(" ").length !== 2) {
                ctx.addIssue({
                    code: "custom",
                    path: ["username"],
                    message: "username must be 2 words long",
                });
            }
        }
    })
};
