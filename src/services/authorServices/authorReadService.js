import Author from "../../models/author.js";

export const getAllAuthors = async () => {
    try {
        return await Author.find();
    } catch (err) {
        throw new Error(err.message);
    }
};

export const getAuthorById = async (authorId) => {
    try {
        return await Author.findById(authorId);
    } catch (err) {
        throw new Error(err.message);
    }
};

