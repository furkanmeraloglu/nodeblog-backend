import mongoose from "mongoose";
import { faker } from '@faker-js/faker';
import PostModel from "../models/postModel.js";
import AuthorModel from "../models/authorModel.js";
import dotenv from "dotenv";

dotenv.config();

const seedPosts = async (num) => {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const mongoURI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
    await mongoose.connect(mongoURI);
    const authors = await AuthorModel.find();
    if (authors.length === 0) {
        console.error("No authors found. Please seed authors first.");
        process.exit(1);
    }
    for (let i = 0; i < num; i++) {
        const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
        const post = new PostModel({
            title: faker.book.title(),
            content: faker.lorem.paragraph({
                min: 1,
                max: 3
            }),
            authorId: randomAuthor._id,
            createdAt: faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2022-01-01T00:00:00.000Z' }),
            updatedAt: faker.date.between({ from: '2022-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' })
        });
        await post.save();
    }
    await mongoose.connection.close();
};

seedPosts(20).then(() => {
    console.log('Seeding complete');
}).catch((err) => {
    console.error('Seeding error:', err);
});