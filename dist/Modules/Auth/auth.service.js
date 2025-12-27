"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utiles/response/error.response");
const user_repository_1 = require("../../DB/repository/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const hash_1 = require("../../Utiles/security/hash");
const generateOtp_1 = require("../../Utiles/generateOtp");
const email_events_1 = require("../../Utiles/events/email.events");
const token_1 = require("../../Utiles/security/token");
class AuthenticationService {
    _userModel;
    constructor() {
        this._userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    }
    signup = async (req, res) => {
        const { username, email, password } = req.body;
        const checkUser = await this._userModel.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser)
            throw new error_response_1.ConflictException("User Already Exists");
        const otp = (0, generateOtp_1.generateOtp)();
        const otpExpiresAt = new Date(Date.now() + 60 * 1000);
        const user = await this._userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_1.generateHash)(password),
                    confirmEmailOTP: await (0, hash_1.generateHash)(otp),
                    otpExpiresAt,
                }
            ],
            options: { validateBeforeSave: true },
        });
        await email_events_1.emailEvent.emit("sendEmail", {
            to: email,
            username,
            otp,
        });
        return res.status(201).json({
            message: "User Created Successfully",
            user,
        });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({
            filter: { email },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (!user.confirmedAt)
            throw new error_response_1.BadRequestException("Verify your account");
        if (!(await (0, hash_1.compareHash)(password, user.password)))
            throw new error_response_1.BadRequestException("Invalid password");
        const credentials = await (0, token_1.createLoginCredentials)(user);
        res.status(200).json({ message: "User loggedin successfully", credentials });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmEmailOTP: { $exists: true },
                confirmedAt: { $exists: false }
            },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            throw new error_response_1.BadRequestException("OTP expired");
        }
        const isValidOtp = await (0, hash_1.compareHash)(otp, user.confirmEmailOTP);
        if (!isValidOtp) {
            throw new error_response_1.BadRequestException("Invalid OTP");
        }
        await this._userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOTP: true, otpExpiresAt: true },
            },
        });
        return res.status(200).json({ message: "User confirmed successfully" });
    };
    logoutDevice = async (req, res) => {
        const { deviceId } = req.body;
        if (!deviceId)
            throw new error_response_1.BadRequestException("Device ID is required");
        const user = await this._userModel.findOne({ filter: { _id: req.user?._id } });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (!user.refreshTokens)
            user.refreshTokens = [];
        user.refreshTokens = user.refreshTokens.filter(rt => rt.deviceId !== deviceId);
        await user.save();
        return res.status(200).json({ message: "Logged out from this device successfully" });
    };
    logoutAllDevices = async (req, res) => {
        const user = await this._userModel.findOne({ filter: { _id: req.user?._id } });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        user.refreshTokens = [];
        await user.save();
        return res.status(200).json({ message: "Logged out from all devices successfully" });
    };
}
exports.default = new AuthenticationService();
