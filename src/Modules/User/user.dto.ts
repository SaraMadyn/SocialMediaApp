import { z } from "zod";
import {logoutSchema} from "./user.validation"
export type LogoutDto = z.infer<typeof logoutSchema.body>;