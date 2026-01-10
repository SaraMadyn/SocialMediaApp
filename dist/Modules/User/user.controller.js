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
const validation_middlewares_1 = require("../../Middlewares/validation.middlewares");
const user_validation_1 = require("./user.validation");
const cloud_multer_1 = require("../../Utiles/multer/cloud.multer");
const router = (0, express_1.Router)();
router.get("/profile", (0, authentication_middleware_1.authentication)({
    tokenType: token_1.tokenTypeEnum.ACCESS,
    accessRoles: [user_model_1.RoleEnum.USER]
}), user_service_1.default.getProfile);
router.post("/logout", (0, authentication_middleware_1.authentication)({
    tokenType: token_1.tokenTypeEnum.ACCESS,
    accessRoles: [user_model_1.RoleEnum.USER]
}), (0, validation_middlewares_1.validation)(user_validation_1.logoutSchema), user_service_1.default.logout);
router.patch("/profile-image", (0, authentication_middleware_1.authentication)({
    tokenType: token_1.tokenTypeEnum.ACCESS,
    accessRoles: [user_model_1.RoleEnum.USER]
}), (0, cloud_multer_1.cloudFileUpload)({
    validation: cloud_multer_1.fileValidation.images,
    storageApproch: cloud_multer_1.StorageEnum.MEMORY,
    maxSizeMB: 6,
}).single("attachments"), user_service_1.default.profileImage);
router.patch("/cover-image", (0, authentication_middleware_1.authentication)({
    tokenType: token_1.tokenTypeEnum.ACCESS,
    accessRoles: [user_model_1.RoleEnum.USER]
}), (0, cloud_multer_1.cloudFileUpload)({
    validation: cloud_multer_1.fileValidation.images,
    storageApproch: cloud_multer_1.StorageEnum.MEMORY,
    maxSizeMB: 6,
}).array("attachments", 5), user_service_1.default.coverImages);
exports.default = router;
