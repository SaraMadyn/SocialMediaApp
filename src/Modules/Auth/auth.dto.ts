import * as z from "zod";
import {signupSchema, loginSchema, confirmEmailSchema} from "./auth.validation";

export type ISignupDTO = z.infer<typeof signupSchema.body>;
export type ILoginDTO = z.infer<typeof loginSchema.body>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;