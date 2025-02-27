import Author from "../../models/author.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NotFoundError, UnauthorizedError } from "../../exceptions/systemErrorExceptions.js";

dotenv.config();

export const loginAuthor = async (params) => {
    const email = params.email;
    const password = params.password;
    try {
        const author = await Author.findOne({ email });
        if (!author) {
            throw new NotFoundError('Could not find an author with this email address');
        }
        const isPasswordMatch = await bcrypt.compare(password, author.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedError('Wrong password!');
        }
        return jwt.sign({id: author._id}, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err;
    }
};