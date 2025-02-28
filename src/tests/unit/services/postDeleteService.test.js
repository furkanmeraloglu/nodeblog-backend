import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let deletePostById;
let mockFindById;
let mockFindByIdAndDelete;
let NotFoundError;

beforeAll(async () => {
    mockFindById = jest.fn();
    mockFindByIdAndDelete = jest.fn();

    jest.unstable_mockModule('../../../models/postModel.js', () => ({
        default: {
            findById: mockFindById,
            findByIdAndDelete: mockFindByIdAndDelete
        }
    }));

    NotFoundError = class extends Error {
        constructor(message) {
            super(message);
            this.name = 'NotFoundError';
            this.statusCode = 404;
        }
    };

    jest.unstable_mockModule('../../../exceptions/systemErrorExceptions.js', () => ({
        NotFoundError
    }));

    const postDeleteService = await import('../../../services/postServices/postDeleteService.js');
    deletePostById = postDeleteService.deletePostById;
});

describe('postDeleteService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('deletePostById', () => {
        it('should delete a post when it exists', async () => {
            const postId = 'post123456';
            const mockPost = { _id: postId, title: 'Test Post' };

            mockFindById.mockResolvedValue(mockPost);
            mockFindByIdAndDelete.mockResolvedValue(mockPost);

            const result = await deletePostById(postId);

            expect(mockFindById).toHaveBeenCalledWith(postId);
            expect(mockFindByIdAndDelete).toHaveBeenCalledWith(postId);
            expect(result).toEqual({success: true});
        });

        it('should throw NotFoundError if post does not exist', async () => {
            const postId = 'nonExistentPost';

            mockFindById.mockResolvedValue(null);

            await expect(deletePostById(postId)).rejects.toThrow('Post not found');
            expect(mockFindById).toHaveBeenCalledWith(postId);
            expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
        });

        it('should propagate database errors', async () => {
            const postId = 'post123456';
            const dbError = new Error('Database connection error');

            mockFindById.mockRejectedValue(dbError);

            await expect(deletePostById(postId)).rejects.toThrow();
            expect(mockFindById).toHaveBeenCalledWith(postId);
            expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
        });

        it('should handle errors during deletion', async () => {
            const postId = 'post123456';
            const mockPost = { _id: postId, title: 'Test Post' };
            const deleteError = new Error('Deletion failed');

            mockFindById.mockResolvedValue(mockPost);
            mockFindByIdAndDelete.mockRejectedValue(deleteError);

            await expect(deletePostById(postId)).rejects.toThrow();
            expect(mockFindById).toHaveBeenCalledWith(postId);
            expect(mockFindByIdAndDelete).toHaveBeenCalledWith(postId);
        });
    });
});