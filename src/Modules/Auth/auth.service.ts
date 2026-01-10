import { Request, Response } from "express";
import { ISignupDTO, ILoginDTO, IConfirmEmailDTO } from "./auth.dto";
import { BadRequestException, ConflictException, NotFoundException } from "../../Utiles/response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { UserModel } from "../../DB/models/user.model";
import { compareHash, generateHash } from "../../Utiles/security/hash";
import { generateOtp } from "../../Utiles/generateOtp";
import { emailEvent } from "../../Utiles/events/email.events";
import {createLoginCredentials} from "../../Utiles/security/token";
class AuthenticationService {

    private _userModel: UserRepository;

    constructor() {
        this._userModel = new UserRepository(UserModel);
    }

    signup = async (req: Request, res: Response): Promise<Response> => {
        const { username, email, password }: ISignupDTO = req.body;

        const checkUser = await this._userModel.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser) throw new ConflictException("User Already Exists");

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 60 * 1000); 

        const user = await this._userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await generateHash(password),
                    confirmEmailOTP: await generateHash(otp),
                    otpExpiresAt,
                }
            ],
            options: { validateBeforeSave: true },
        });

        await emailEvent.emit("sendEmail", {
            to: email,
            username,
            otp,
        });

        return res.status(201).json({
            message: "User Created Successfully",
            user,
        });
    };

    login = async (req: Request, res: Response) => {
        const { email, password }: ILoginDTO = req.body;
        const user= await this._userModel.findOne({
            filter:{email},
        });
        if(!user) throw new NotFoundException("User not found");
        if(!user.confirmedAt) throw new BadRequestException("Verify your account");
        if(!(await compareHash(password, user.password)))
            throw new BadRequestException("Invalid password")
        const credentials= await createLoginCredentials(user);

        res.status(200).json({ message: "User loggedin successfully",credentials });
    };

    confirmEmail = async (req: Request, res: Response): Promise<Response> => {
        const { email, otp }: IConfirmEmailDTO = req.body;

        const user = await this._userModel.findOne({
            filter: { 
                email, 
                confirmEmailOTP: { $exists: true }, 
                confirmedAt: { $exists: false } 
            },
        });

        if (!user) throw new NotFoundException("User not found");

        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            throw new BadRequestException("OTP expired");
        }

        const isValidOtp = await compareHash(otp, user.confirmEmailOTP as string);
        if (!isValidOtp) {
            throw new BadRequestException("Invalid OTP");
        }

        await this._userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOTP: true, otpExpiresAt: true },
            },
        });

        return res.status(200).json({ message: "User confirmed successfully" });
    };
}



export default new AuthenticationService();

