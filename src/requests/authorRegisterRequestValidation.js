import { body } from "express-validator";

export const validateAuthorRegisterRequest = [
    body('name').notEmpty().withMessage('Name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().notEmpty().withMessage('Email is required'),
    body('password').isLength(6).notEmpty().withMessage('Password must be at least 6 characters long'),
];