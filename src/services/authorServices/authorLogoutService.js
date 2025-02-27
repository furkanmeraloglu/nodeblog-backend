import Author from "../../models/author.js";
import {NotFoundError, UnauthorizedError} from "../../exceptions/systemErrorExceptions.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authorToken from "jsonwebtoken";
import authorTokenBlacklist from "../../models/authorTokenBlacklist.js";


export const logoutAndInvalidateAuthorToken = async (token) => {
    if (!token) {
        throw new NotFoundError('Please sign in to your account!');
    }

    await createAuthorTokenBlacklist(token);
    return true;
};

export const extractToken = (req) => {
    if (req.cookies && req.cookies.jwt) {
        return req.cookies.jwt;
    }

    if (req.body && req.body.token) {
        return req.body.token;
    }

    if (req.headers && req.headers.authorization) {
        return req.headers.authorization.replace('Bearer ', '');
    }

    return null;
};

const createAuthorTokenBlacklist = async (token) => {
    const decoded = jwt.decode(token);
    const tokenExpirationTimestamp = decoded.exp * 1000;
    await authorTokenBlacklist.create({
        token: token,
        expiresAt: new Date(tokenExpirationTimestamp),
    });
};