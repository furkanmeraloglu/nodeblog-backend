import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {validatePostCreateRequest} from "../requests/postCreateRequestValidation.js";
import {validatePostUpdateRequest} from "../requests/postUpdateRequestValidation.js";
import {getPost, getPosts} from "../controllers/post/postReadController.js";
import {createPost} from "../controllers/post/postCreateController.js";

const router = express.Router();

router.get('/', getPosts);
router.get('/:postId', getPost);
router.post('/', authMiddleware, validatePostCreateRequest, createPost);
// router.patch('/:postId', authMiddleware, validatePostUpdateRequest, updatePost);
// router.delete('/:postId', authMiddleware, deletePost);

export default router;