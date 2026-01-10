import { model, models, Schema, Types, HydratedDocument } from "mongoose";

export interface IToken {
   jti:string;
   expiresIN: number;
   userId: Types.ObjectId;

}

export const tokenSchema = new Schema<IToken>(
    {
        jti:{
          type: String,
          required: true,
          unique: true,
        },
        expiresIN:{
          type: Number,
          required: true,
        },
        userId:{
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }
    },
    { timestamps: true }
);

export const TokenModel = models.Token || model("Token", tokenSchema);
export type HTokenDocument = HydratedDocument<IToken>;
