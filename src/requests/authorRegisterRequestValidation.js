import { body } from "express-validator";

export const validateAuthorRegisterRequest = [
    body('name').notEmpty().isString().withMessage('Name is required'),
    body('username').notEmpty().isString().withMessage('Username is required'),
    body('email').isEmail().notEmpty().isString().withMessage('Email is required'),
    body('password').isLength(6).isString().notEmpty().withMessage('Password must be at least 6 characters long'),
];