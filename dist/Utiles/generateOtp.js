"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const generateOtp = () => {
    return String(Math.floor(Math.random() * (900000 - 100000) + 100000));
};
exports.generateOtp = generateOtp;
