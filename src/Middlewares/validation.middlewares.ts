import { NextFunction, Request, Response } from "express";
import {BadRequestException} from "../Utiles/response/error.response";
import { ZodError, ZodType } from "zod";
import * as z from "zod";

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validationErrors: Array<{
                key: KeyReqType;
                issues: Array<{ message: string; path: (string | number)[] }>;
            }> = [];

            for (const key of Object.keys(schema) as KeyReqType[]) {
                if (!schema[key]) continue;

                const validationResults = schema[key]!.safeParse(req[key]);

                if (!validationResults.success) {
                    const errors = validationResults.error as ZodError;

                    validationErrors.push({
                        key,
                        issues: errors.issues.map((issue) => ({
                            message: issue.message,
                            path: issue.path,
                        })),
                    });
                }
            }

            if (validationErrors.length > 0) {
                return next(
                    new BadRequestException("Validation Error", {
                        cause: validationErrors,
                    })
                );
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
};

export const generalFields = {
    username: z
        .string({ required_error: "username is required" })
        .min(3, "username must be at least 3 characters long")
        .max(30, "username must be at most 30 characters long"),
    email: z.string().email("invalid email address"),
    password: z.string(),
    confirmPassword: z.string(),
    otp: z.string().regex(/^\d{6}$/)
};
