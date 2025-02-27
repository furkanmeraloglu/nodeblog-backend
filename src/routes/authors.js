// src/routes/authors.js
import express from "express";
import {validateAuthorRegisterRequest} from "../requests/authorRegisterRequestValidation.js";
import {validateAuthorLoginRequest} from "../requests/authorLoginRequestValidation.js";
import {validateAuthorUpdateRequest} from "../requests/authorUpdateRequestValidation.js";
import { register, login, logout } from "../controllers/author/authorAuthController.js";
import { getAuthors, getAuthor } from "../controllers/author/authorReadController.js";
import { updateAuthor } from "../controllers/author/authorUpdateController.js";

const router = express.Router();

router.get('/', getAuthors);
router.get('/:authorId', getAuthor);
router.post('/register', validateAuthorRegisterRequest, register);
router.post('/login', validateAuthorLoginRequest, login);
router.post('/logout', logout);
router.patch('/:authorId', validateAuthorUpdateRequest, updateAuthor);

export default router;