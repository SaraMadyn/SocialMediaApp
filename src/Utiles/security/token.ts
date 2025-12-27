
import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { HUserDocument, RoleEnum, UserModel } from "../../DB/models/user.model";
import { v4 as uuidv4 } from "uuid";
import { NotFoundException, UnAuthorizedException } from "../response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";

export enum signutureLevelEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum tokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
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
  const userRepo = new UserRepository(UserModel);

  const [role, token] = authorization.split(" ");

  if (!role || !token)
    throw new UnAuthorizedException("Invalid authorization format");

  if (
    role !== signutureLevelEnum.USER &&
    role !== signutureLevelEnum.ADMIN
  ) {
    throw new UnAuthorizedException("Invalid role in authorization header");
  }

  const signutures = await getSignuture(role);

  const decoded = await verifyToken({
    token,
    secret:
      tokenType === tokenTypeEnum.REFRESH
        ? signutures.refresh_token
        : signutures.access_token,
  });

  if (!decoded?._id)
    throw new UnAuthorizedException("Invalid token payload");

  const user = await userRepo.findOne({ filter: { _id: decoded._id } });

  if (!user) throw new NotFoundException("User not found");

  return { user, decoded };
};
