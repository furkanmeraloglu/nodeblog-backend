import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let createNewPost;
let mockSave;
let mockPostModel;

beforeAll(async () => {
    mockSave = jest.fn();
    mockPostModel = jest.fn().mockImplementation(function(data) {
        this.title = data.title;
        this.content = data.content;
        this.authorId = data.authorId;
        this.save = mockSave;
        return this;
    });

    jest.unstable_mockModule('../../../models/postModel.js', () => ({
        default: mockPostModel
    }));

    const postCreateService = await import('../../../services/postServices/postCreateService.js');
    createNewPost = postCreateService.createNewPost;
});

describe('postCreateService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createNewPost', () => {
        it('should create a new post with all required fields', async () => {
            const postData = {
                title: 'Test Post Title',
                content: 'This is test content',
                authorId: 'author123'
            };

            const savedPost = {...postData, _id: 'post123'};
            mockSave.mockResolvedValue(savedPost);

            const result = await createNewPost(postData);

            expect(mockPostModel).toHaveBeenCalledWith({
                title: postData.title,
                content: postData.content,
                authorId: postData.authorId
            });
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual(savedPost);
        });

        it('should throw an error if post creation fails', async () => {
            const postData = {
                title: 'Test Post Title',
                content: 'This is test content',
                authorId: 'author123'
            };

            const errorMessage = 'Validation failed';
            mockSave.mockRejectedValue(new Error(errorMessage));

            await expect(createNewPost(postData)).rejects.toThrow(errorMessage);
            expect(mockPostModel).toHaveBeenCalledWith({
                title: postData.title,
                content: postData.content,
                authorId: postData.authorId
            });
            expect(mockSave).toHaveBeenCalled();
        });

        it('should throw an error if required fields are missing', async () => {
            const postData = {
                title: 'Test Post Title',
                content: 'This is test content'
                // authorId is missing
            };

            const errorMessage = 'Author ID is required';
            mockSave.mockRejectedValue(new Error(errorMessage));

            await expect(createNewPost(postData)).rejects.toThrow(errorMessage);
            expect(mockPostModel).toHaveBeenCalledWith({
                title: postData.title,
                content: postData.content,
                authorId: undefined
            });
        });
    });
});