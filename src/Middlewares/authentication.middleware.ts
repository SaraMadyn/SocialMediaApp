import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../DB/models/user.model";
import { decodedToken, tokenTypeEnum } from "../Utiles/security/token";
import { BadRequestException, ForbiddenException } from "../Utiles/response/error.response";

export const authentication = ({
  tokenType = tokenTypeEnum.ACCESS,
  accessRoles = [],
}: {
  tokenType?: tokenTypeEnum;
  accessRoles?: RoleEnum[];
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization)
      throw new BadRequestException("Missing authorization header");

    const { decoded, user } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    if (accessRoles.length && !accessRoles.includes(user.role))
      throw new ForbiddenException("You aren't authorized");

    req.user = user;
    req.decoded = decoded;
    next();
  };
};
