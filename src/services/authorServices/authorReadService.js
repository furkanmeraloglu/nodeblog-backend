import AuthorModel from "../../models/authorModel.js";
import {NotFoundError} from "../../exceptions/systemErrorExceptions.js";

export const getAllAuthors = async () => {
    try {
        const authors = await AuthorModel.find();
        if (!authors) {
            return [];
        }
        return authors;
    } catch (err) {
        throw new Error(err.message);
    }
};

export const getAuthorById = async (authorId) => {
    try {
        const author = await AuthorModel.findById(authorId);
        if (!author) {
            throw new NotFoundError("Author not found");
        }
        return author;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err;
    }
};

