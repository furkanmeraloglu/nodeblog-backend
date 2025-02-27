import { validationResult } from "express-validator";
import { registerNewAuthor } from "../../services/authorServices/authorRegisterService.js";
import { loginAuthor } from "../../services/authorServices/authorLoginService.js";
import { extractToken, logoutAndInvalidateAuthorToken } from "../../services/authorServices/authorLogoutService.js";

export const register = async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({
            errors: validationErrors.array(),
        });
    }
    try {
        const author = await registerNewAuthor(req.body);
        res.status(201).json(author);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};

export const login = async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({
            errors: validationErrors.array(),
        });
    }
    try {
        const authorToken = await loginAuthor(req.body);
        res.status(200).json(authorToken);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        const token = extractToken(req);
        await logoutAndInvalidateAuthorToken(token);

        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};