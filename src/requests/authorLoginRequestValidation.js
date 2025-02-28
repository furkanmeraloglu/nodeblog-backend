import { body } from "express-validator";

export const validateAuthorLoginRequest = [
    body('email').isEmail().isString().notEmpty().withMessage('Email is required'),
    body('password').isLength(6).isString().notEmpty().withMessage('Password must be at least 6 characters long'),
];