import { body } from "express-validator";

export const loginValidation = [
    body('email', 'Incorrect email').isEmail(),
    body('password', 'Too short password').isLength({ min: 3 }),
];

export const registerValidator = [
    body('email', 'Incorrect email').isEmail(),
    body('password', 'Too short password').isLength({min: 3}),
    body('nickname', 'Too short name').isLength({min: 3}),
]