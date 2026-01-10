import { Request, Response } from "express";
import{LogoutDto} from"./user.dto"
import { createRevokeToken, LogoutEnum } from "../../Utiles/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { uploadFile,uploadFiles, uploadLargeFile } from "../../Utiles/multer/s3.config";
class UserService {
    private _userModel= new UserRepository(UserModel);
    constructor() {}

    getProfile= async(req:Request,res:Response): Promise<Response> =>{
        return res.status(200).json({message:"Done", data:{user:req.user, decoded:req.decoded}})
    }

    logout = async (req: Request, res: Response): Promise<Response> => {
        const { flag }: LogoutDto = req.body;
        let statusCode: number = 200;
        const update: UpdateQuery<IUser> = {}
        switch(flag){
            case LogoutEnum.ONLY:
              await createRevokeToken(req.decoded as JwtPayload);
              statusCode= 201;
              break;
            case LogoutEnum.ALL:
              update.changeCredentialsTime= new Date();
              break;
            default:
              break;
        }
        await this._userModel.updateOne({ 
            filter: {_id: req.decoded?._id},
            update,
        })
        return res.status(statusCode).json({ 
            message: "Done" 
        });
    };

    profileImage = async (req: Request, res: Response): Promise<Response> => {
    if (!req.decoded) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!req.file) {
        return res.status(400).json({ message: "File is required" });
    }

    const Key = await uploadFile({
        path: `users/${req.decoded._id}`,
        file: req.file,
    });

    await this._userModel.updateOne({
        filter: { _id: req.decoded._id },
        update: { profileImage: Key },
    });

    return res.status(200).json({ message: "Done" });
};

    coverImages = async (req: Request, res: Response): Promise<Response> => {
        const urls= await uploadFiles({
            path: `users/${req.decoded?._id}/cover`,
            files: req.files as Express.Multer.File[],
        });

    return res.status(200).json({ message: "Done", urls });
};


}

export default new UserService();
