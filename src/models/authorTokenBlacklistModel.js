import mongoose from "mongoose";

const authorTokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
});

const authorTokenBlacklistModel = mongoose.model("AuthorTokenBlacklist", authorTokenBlacklistSchema);

export default authorTokenBlacklistModel;