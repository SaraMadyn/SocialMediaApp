
import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { HUserDocument, RoleEnum, UserModel } from "../../DB/models/user.model";
import { v4 as uuidv4 } from "uuid";
import { BadRequestException, NotFoundException, UnAuthorizedException } from "../response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenRepository } from "../../DB/repository/token.repository";
import { TokenModel } from "../../DB/models/token.model";

export enum signutureLevelEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum tokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}

export enum LogoutEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}

export const generateToken = async ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options?: SignOptions;
}): Promise<string> => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): Promise<JwtPayload> => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const getSignutureLevel = async (
  role: RoleEnum = RoleEnum.USER
): Promise<signutureLevelEnum> => {
  return role === RoleEnum.ADMIN
    ? signutureLevelEnum.ADMIN
    : signutureLevelEnum.USER;
};

export const getSignuture = async (
  signutureLevel: signutureLevelEnum
): Promise<{ access_token: string; refresh_token: string }> => {
  if (signutureLevel === signutureLevelEnum.ADMIN) {
    return {
      access_token: process.env.ACCESS_ADMIN_TOKEN_SECRET!,
      refresh_token: process.env.REFRESH_ADMIN_TOKEN_SECRET!,
    };
  }

  return {
    access_token: process.env.ACCESS_USER_TOKEN_SECRET!,
    refresh_token: process.env.REFRESH_USER_TOKEN_SECRET!,
  };
};

export const createLoginCredentials = async (
  user: HUserDocument
): Promise<{ access_token: string; refresh_token: string }> => {
  const signutureLevel = await getSignutureLevel(user.role);
  const signutures = await getSignuture(signutureLevel);
  const jwtid = uuidv4();

  const access_token = await generateToken({
    payload: { _id: user._id },
    secret: signutures.access_token,
    options: {
      expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
      jwtid,
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    secret: signutures.refresh_token,
    options: {
      expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
      jwtid,
    },
  });

  return { access_token, refresh_token };
};

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.ACCESS,
}: {
  authorization: string;
  tokenType?: tokenTypeEnum;
}) => {
  const userModel = new UserRepository(UserModel);
  const tokenModel = new TokenRepository(TokenModel);

  const [bearer, token] = authorization.split(" ");

  if (!bearer || !token)
    throw new UnAuthorizedException("Invalid authorization format");

  if (
    bearer !== signutureLevelEnum.USER &&
    bearer !== signutureLevelEnum.ADMIN
  ) {
    throw new UnAuthorizedException("Invalid role in authorization header");
  }

  const signutures = await getSignuture(bearer as signutureLevelEnum);

  const decoded = await verifyToken({
    token,
    secret:
      tokenType === tokenTypeEnum.REFRESH
        ? signutures.refresh_token
        : signutures.access_token,
  });

  if (!decoded?._id || !decoded?.iat)
    throw new UnAuthorizedException("Invalid token payload");

  if (await tokenModel.findOne({ filter: { jti: decoded.jti as string} }))
    throw new NotFoundException("Token already revoked");

  const user = await userModel.findOne({ filter: { _id: decoded._id } });

  if (!user) throw new NotFoundException("User not found");

  if (user.changeCredentialsTime && decoded.iat * 1000 < user.changeCredentialsTime.getTime()) {
    throw new UnAuthorizedException("loggedout from all devices");
}

  return { user, decoded };
};

export const createRevokeToken= async(decoded: JwtPayload) =>{
  const tokenModel= new TokenRepository(TokenModel);
  const [results]= await tokenModel.create({
    data: [{
      jti: decoded.jti as string,
      expiresIN: decoded.iat as number, 
      userId: decoded._id,
    }]
  }) || [];
  if(!results) throw new BadRequestException("fail to revoke token");

  return results;
}