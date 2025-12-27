import bcrypt from "bcrypt";

export const generateHash = async (plainText: string): Promise<string> => {
    const saltRounds = Number(process.env.SALT) ; 
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainText, salt);
    return hash;
};

export const compareHash = async (plainText: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plainText, hashed);
};
