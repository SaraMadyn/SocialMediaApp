"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const token_1 = require("../Utiles/security/token");
const error_response_1 = require("../Utiles/response/error.response");
const authentication = ({ tokenType = token_1.tokenTypeEnum.ACCESS, accessRoles = [], }) => {
    return async (req, res, next) => {
        if (!req.headers.authorization)
            throw new error_response_1.BadRequestException("Missing authorization header");
        const { decoded, user } = await (0, token_1.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (accessRoles.length && !accessRoles.includes(user.role))
            throw new error_response_1.ForbiddenException("You aren't authorized");
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
