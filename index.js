import express from 'express';
import cookieParser from 'cookie-parser';
import authorRoutes from './src/routes/authors.js';
import postRoutes from './src/routes/posts.js';
import connectDB from "./src/config/database.js";
import mongoose from "mongoose";

connectDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/authors', authorRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
    res.send('Hello node-blog');
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});