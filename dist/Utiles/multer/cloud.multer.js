"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = exports.StorageEnum = void 0;
const multer_1 = __importDefault(require("multer"));
const node_os_1 = __importDefault(require("node:os"));
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
var StorageEnum;
(function (StorageEnum) {
    StorageEnum["MEMORY"] = "MEMORY";
    StorageEnum["DISK"] = "DISK";
})(StorageEnum || (exports.StorageEnum = StorageEnum = {}));
exports.fileValidation = {
    images: ["image/png", "image/jpeg", "image/jpg"],
    pdf: ["application/pdf"],
    doc: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
};
const cloudFileUpload = ({ validation = [], storageApproch = StorageEnum.MEMORY, maxSizeMB = 2, }) => {
    const storage = storageApproch === StorageEnum.MEMORY
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination: node_os_1.default.tmpdir(),
            filename: (req, file, cb) => {
                cb(null, `${(0, uuid_1.v4)()}-${file.originalname}`);
            },
        });
    function fileFilter(req, file, cb) {
        if (!validation.includes(file.mimetype)) {
            return cb(new error_response_1.BadRequestException("Invalid file type"));
        }
        return cb(null, true);
    }
    return (0, multer_1.default)({
        fileFilter,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024
        },
        storage
    });
};
exports.cloudFileUpload = cloudFileUpload;
