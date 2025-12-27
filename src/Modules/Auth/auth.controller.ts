import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middlewares";
import { signupSchema, confirmEmailSchema } from "./auth.validation";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utiles/security/token";
const router: Router = Router();

router.post("/signup",validation(signupSchema), authService.signup);
router.post("/login", authService.login);
router.patch("/confirm-email",validation(confirmEmailSchema) ,authService.confirmEmail);

router.patch(
    "/logout-device",
    authentication({ tokenType: tokenTypeEnum.ACCESS }),
    authService.logoutDevice
);

router.patch(
    "/logout-all",
    authentication({ tokenType: tokenTypeEnum.ACCESS }),
    authService.logoutAllDevices
);

export default router;

