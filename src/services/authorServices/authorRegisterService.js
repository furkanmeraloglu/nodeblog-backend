import Author from "../../models/author.js";
import bcrypt from 'bcrypt';

export const registerNewAuthor = async (params) => {
    const hashedPassword = await bcrypt.hash(params.password, 10);

    const author = new Author({
        name: params.name,
        username: params.username,
        email: params.email,
        password: hashedPassword,
    });
    try {
        return await author.save();
    } catch (err) {
        throw new Error(err.message);
    }
};