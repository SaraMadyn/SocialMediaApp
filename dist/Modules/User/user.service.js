"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utiles/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const s3_config_1 = require("../../Utiles/multer/s3.config");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getProfile = async (req, res) => {
        return res.status(200).json({ message: "Done", data: { user: req.user, decoded: req.decoded } });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_1.LogoutEnum.ONLY:
                await (0, token_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
            case token_1.LogoutEnum.ALL:
                update.changeCredentialsTime = new Date();
                break;
            default:
                break;
        }
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(statusCode).json({
            message: "Done"
        });
    };
    profileImage = async (req, res) => {
        if (!req.decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }
        const Key = await (0, s3_config_1.uploadFile)({
            path: `users/${req.decoded._id}`,
            file: req.file,
        });
        await this._userModel.updateOne({
            filter: { _id: req.decoded._id },
            update: { profileImage: Key },
        });
        return res.status(200).json({ message: "Done" });
    };
    coverImages = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            path: `users/${req.decoded?._id}/cover`,
            files: req.files,
        });
        return res.status(200).json({ message: "Done", urls });
    };
}
exports.default = new UserService();
