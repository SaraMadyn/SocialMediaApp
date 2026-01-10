import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { StorageEnum } from "./cloud.multer";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";

export const s3Config = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

export const uploadFile = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
    Body: storageApproch === StorageEnum.MEMORY ? file.buffer : file.path,
    ContentType: file.mimetype,
  });
  await s3Config().send(command); 

  console.log(command.input.Key);
  if(!command?.input?.Key)
    throw new BadRequestException("Failed to upload file");

  return command.input.Key;
};

export const uploadLargeFile = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const upload = new Upload({ 
    client: s3Config(),
    params:{
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
      Body: storageApproch === StorageEnum.MEMORY ? file.buffer : file.path,
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024,
   });
   upload.on("httpUploadProgress", (progress) => {
    console.log("upload progress",progress);
   })
   const {Key}= await upload.done();
   if(!Key)
    throw new BadRequestException("Failed to upload file");

  return Key;
};

export const uploadFiles = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}) => {
  let urls:string[]=[];
  for(const file of files){
    const key= await uploadFile({storageApproch,Bucket,ACL,path,file})
    urls.push(key);
  }
  return urls;
};