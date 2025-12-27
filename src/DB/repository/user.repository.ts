import { DatabaseRepository } from "./database.repository";
import { IUser } from "../models/user.model";
import { BadRequestException } from "../../Utiles/response/error.response";
import { CreateOptions, Model } from "mongoose";

export class UserRepository extends DatabaseRepository<IUser> {
    constructor(protected override readonly model: Model<IUser>) {
        super(model);
    }

    async createUser({
        data = [],
        options = {},
    }: {
        data: Partial<IUser>[];
        options?: CreateOptions;
    }) {
        const [user] = (await this.create({ data, options })) || [];
        if (!user) {
            throw new BadRequestException("fail to signup");
        }
        return user;
    }
}
