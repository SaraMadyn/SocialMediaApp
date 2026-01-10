import { z } from "zod";
import { LogoutEnum } from "../../Utiles/security/token";

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogoutEnum).default(LogoutEnum.ONLY)
  })
};