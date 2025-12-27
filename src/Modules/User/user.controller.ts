import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utiles/security/token";
import userService from "./user.service";
import { RoleEnum } from "../../DB/models/user.model";
const router: Router = Router();

router.get(
    "/profile", 
    authentication({
        tokenType:tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER]
    }), 
    userService.getProfile
);

export default router;

