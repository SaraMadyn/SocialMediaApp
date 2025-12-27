"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateHash = async (plainText) => {
    const saltRounds = Number(process.env.SALT);
    const salt = await bcrypt_1.default.genSalt(saltRounds);
    const hash = await bcrypt_1.default.hash(plainText, salt);
    return hash;
};
exports.generateHash = generateHash;
const compareHash = async (plainText, hashed) => {
    return await bcrypt_1.default.compare(plainText, hashed);
};
exports.compareHash = compareHash;
