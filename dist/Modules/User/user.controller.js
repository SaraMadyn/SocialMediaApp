"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_1 = require("../../Utiles/security/token");
const user_service_1 = __importDefault(require("./user.service"));
const user_model_1 = require("../../DB/models/user.model");
const router = (0, express_1.Router)();
router.get("/profile", (0, authentication_middleware_1.authentication)({
    tokenType: token_1.tokenTypeEnum.ACCESS,
    accessRoles: [user_model_1.RoleEnum.USER]
}), user_service_1.default.getProfile);
exports.default = router;
