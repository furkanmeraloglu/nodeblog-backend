import mongoose from "mongoose";
import { faker } from '@faker-js/faker';
import AuthorModel from "../models/authorModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const seedAuthors = async (num) => {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const mongoURI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
    await mongoose.connect(mongoURI);

    for (let i = 0; i < num; i++) {
        const hashedPassword = await bcrypt.hash('password', 10);
        const author = new AuthorModel({
            name: faker.person.fullName(),
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: hashedPassword,
            avatar: faker.image.avatar(),
            createdAt: faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' }),
            updatedAt: faker.date.between({ from: '2022-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' })
        });
        await author.save();
    }
    await mongoose.connection.close();
};

seedAuthors(30).then(() => {
    console.log('Seeding complete');
}).catch((err) => {
    console.error('Seeding error:', err);
});