"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = exports.uploadLargeFile = exports.uploadFile = exports.s3Config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_s3_2 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const cloud_multer_1 = require("./cloud.multer");
const error_response_1 = require("../response/error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3Config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3Config = s3Config;
const uploadFile = async ({ storageApproch = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_2.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
        Body: storageApproch === cloud_multer_1.StorageEnum.MEMORY ? file.buffer : file.path,
        ContentType: file.mimetype,
    });
    await (0, exports.s3Config)().send(command);
    console.log(command.input.Key);
    if (!command?.input?.Key)
        throw new error_response_1.BadRequestException("Failed to upload file");
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadLargeFile = async ({ storageApproch = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
            Body: storageApproch === cloud_multer_1.StorageEnum.MEMORY ? file.buffer : file.path,
            ContentType: file.mimetype,
        },
        partSize: 500 * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log("upload progress", progress);
    });
    const { Key } = await upload.done();
    if (!Key)
        throw new error_response_1.BadRequestException("Failed to upload file");
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const uploadFiles = async ({ storageApproch = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, }) => {
    let urls = [];
    for (const file of files) {
        const key = await (0, exports.uploadFile)({ storageApproch, Bucket, ACL, path, file });
        urls.push(key);
    }
    return urls;
};
exports.uploadFiles = uploadFiles;
