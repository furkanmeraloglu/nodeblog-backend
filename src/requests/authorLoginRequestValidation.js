import { body } from "express-validator";

export const validateAuthorLoginRequest = [
    body('email').isEmail().notEmpty().withMessage('Email is required'),
    body('password').isLength(6).notEmpty().withMessage('Password must be at least 6 characters long'),
];