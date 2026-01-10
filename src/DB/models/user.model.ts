import { model, models, Schema, Types, HydratedDocument } from "mongoose";

export enum GenderEnum {
    MALE = "MALE",
    FEMALE = "FEMALE",
}

export enum RoleEnum {
    USER = "USER",
    ADMIN = "ADMIN",
}

export interface IUser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    username?: string;

    email: string;
    confirmEmailOTP?: string;
    confirmedAt?: Date;
    changeCredentialsTime: Date;

    password: string;
    resetPasswordOTP?: string;

    phone: string;
    address?: string;
    gender: GenderEnum;
    role: RoleEnum;
    profileImage: string;


    createdAt: Date;
    updatedAt: Date;
}

export const userSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
        lastName: { type: String, required: true, minLength: 2, maxLength: 25 },
        email: { type: String, required: true, unique: true },
        confirmEmailOTP: String,
        confirmedAt: Date,
        changeCredentialsTime: Date,
        password: { type: String, required: true },
        resetPasswordOTP: String,
        phone: String,
        address: String,
        profileImage: String,
        gender: {
            type: String,
            enum: Object.values(GenderEnum),
            default: GenderEnum.MALE,
        },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.USER,
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema
    .virtual("username")
    .set(function (value: string) {
        const [firstName, lastName] = value.split(" ") || [];
        this.set({ firstName, lastName });
    })
    .get(function () {
        return `${this.firstName} ${this.lastName}`;
    });

export const UserModel = models.Users || model("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
