import AuthorModel from "../../models/authorModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NotFoundError, UnauthorizedError } from "../../exceptions/systemErrorExceptions.js";

dotenv.config();

const ACCESS_TOKEN_EXPIRY = 3600;

export const loginAuthor = async (params) => {
    const email = params.email;
    const password = params.password;
    try {
        const author = await AuthorModel.findOne({ email });
        if (!author) {
            throw new NotFoundError('Could not find an author with this email address');
        }
        const isPasswordMatch = await bcrypt.compare(password, author.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedError('Wrong password!');
        }

        return {
            token_type: 'bearer',
            access_token: jwt.sign(
                {id: author._id},
                process.env.JWT_SECRET,
                {expiresIn: ACCESS_TOKEN_EXPIRY}
            ),
            refresh_token: jwt.sign(
                {id: author._id, type: 'refresh'},
                process.env.JWT_SECRET,
                {expiresIn: '7d'}
            ),
            expires_in: ACCESS_TOKEN_EXPIRY
        };

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err;
    }
};