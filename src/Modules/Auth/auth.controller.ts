import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middlewares";
import { signupSchema, confirmEmailSchema } from "./auth.validation";

const router: Router = Router();

router.post("/signup",validation(signupSchema), authService.signup);
router.post("/login", authService.login);
router.patch("/confirm-email",validation(confirmEmailSchema) ,authService.confirmEmail);

export default router;

