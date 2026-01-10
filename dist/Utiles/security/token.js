"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.createLoginCredentials = exports.getSignuture = exports.getSignutureLevel = exports.verifyToken = exports.generateToken = exports.LogoutEnum = exports.tokenTypeEnum = exports.signutureLevelEnum = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../../DB/models/user.model");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/repository/user.repository");
const token_repository_1 = require("../../DB/repository/token.repository");
const token_model_1 = require("../../DB/models/token.model");
var signutureLevelEnum;
(function (signutureLevelEnum) {
    signutureLevelEnum["USER"] = "USER";
    signutureLevelEnum["ADMIN"] = "ADMIN";
})(signutureLevelEnum || (exports.signutureLevelEnum = signutureLevelEnum = {}));
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum["ACCESS"] = "ACCESS";
    tokenTypeEnum["REFRESH"] = "REFRESH";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["ONLY"] = "ONLY";
    LogoutEnum["ALL"] = "ALL";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret, options, }) => {
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret, }) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const getSignutureLevel = async (role = user_model_1.RoleEnum.USER) => {
    return role === user_model_1.RoleEnum.ADMIN
        ? signutureLevelEnum.ADMIN
        : signutureLevelEnum.USER;
};
exports.getSignutureLevel = getSignutureLevel;
const getSignuture = async (signutureLevel) => {
    if (signutureLevel === signutureLevelEnum.ADMIN) {
        return {
            access_token: process.env.ACCESS_ADMIN_TOKEN_SECRET,
            refresh_token: process.env.REFRESH_ADMIN_TOKEN_SECRET,
        };
    }
    return {
        access_token: process.env.ACCESS_USER_TOKEN_SECRET,
        refresh_token: process.env.REFRESH_USER_TOKEN_SECRET,
    };
};
exports.getSignuture = getSignuture;
const createLoginCredentials = async (user) => {
    const signutureLevel = await (0, exports.getSignutureLevel)(user.role);
    const signutures = await (0, exports.getSignuture)(signutureLevel);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signutures.access_token,
        options: {
            expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
            jwtid,
        },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signutures.refresh_token,
        options: {
            expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
            jwtid,
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = tokenTypeEnum.ACCESS, }) => {
    const userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    const tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token)
        throw new error_response_1.UnAuthorizedException("Invalid authorization format");
    if (bearer !== signutureLevelEnum.USER &&
        bearer !== signutureLevelEnum.ADMIN) {
        throw new error_response_1.UnAuthorizedException("Invalid role in authorization header");
    }
    const signutures = await (0, exports.getSignuture)(bearer);
    const decoded = await (0, exports.verifyToken)({
        token,
        secret: tokenType === tokenTypeEnum.REFRESH
            ? signutures.refresh_token
            : signutures.access_token,
    });
    if (!decoded?._id || !decoded?.iat)
        throw new error_response_1.UnAuthorizedException("Invalid token payload");
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } }))
        throw new error_response_1.NotFoundException("Token already revoked");
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user)
        throw new error_response_1.NotFoundException("User not found");
    if (user.changeCredentialsTime && decoded.iat * 1000 < user.changeCredentialsTime.getTime()) {
        throw new error_response_1.UnAuthorizedException("loggedout from all devices");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    const [results] = await tokenModel.create({
        data: [{
                jti: decoded.jti,
                expiresIN: decoded.iat,
                userId: decoded._id,
            }]
    }) || [];
    if (!results)
        throw new error_response_1.BadRequestException("fail to revoke token");
    return results;
};
exports.createRevokeToken = createRevokeToken;
