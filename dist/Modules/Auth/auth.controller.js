"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const validation_middlewares_1 = require("../../Middlewares/validation.middlewares");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post("/signup", (0, validation_middlewares_1.validation)(auth_validation_1.signupSchema), auth_service_1.default.signup);
router.post("/login", auth_service_1.default.login);
router.patch("/confirm-email", (0, validation_middlewares_1.validation)(auth_validation_1.confirmEmailSchema), auth_service_1.default.confirmEmail);
exports.default = router;
