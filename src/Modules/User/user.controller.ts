import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utiles/security/token";
import userService from "./user.service";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validation.middlewares";
import {logoutSchema} from "./user.validation";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utiles/multer/cloud.multer";

const router: Router = Router();

router.get(
    "/profile", 
    authentication({
        tokenType:tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER]
    }), 
    userService.getProfile
);

router.post(
    "/logout", 
    authentication({
        tokenType:tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER]
    }), 
    validation(logoutSchema),
    userService.logout
); 

router.patch(
    "/profile-image", 
    authentication({
        tokenType: tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER]
    }), 
    cloudFileUpload({
        validation: fileValidation.images,
        storageApproch: StorageEnum.MEMORY,
        maxSizeMB: 6,
    }).single("attachments"),
    userService.profileImage
);

router.patch(
    "/cover-image", 
    authentication({
        tokenType: tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER]
    }), 
    cloudFileUpload({
        validation: fileValidation.images,
        storageApproch: StorageEnum.MEMORY,
        maxSizeMB: 6,
    }).array("attachments",5),
    userService.coverImages
);

export default router;

