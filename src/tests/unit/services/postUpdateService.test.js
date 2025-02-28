import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let updatePostById;
let mockFindById;
let mockFindByIdAndUpdate;

beforeAll(async () => {
    mockFindByIdAndUpdate = jest.fn();
    mockFindById = jest.fn();

    jest.unstable_mockModule('../../../models/postModel.js', () => ({
        default: {
            findById: mockFindById,
            findByIdAndUpdate: mockFindByIdAndUpdate
        }
    }));

    jest.unstable_mockModule('../../../exceptions/systemErrorExceptions', () => ({
        NotFoundError: class NotFoundError extends Error {
            constructor(message) {
                super(message);
                this.name = 'NotFoundError';
                this.statusCode = 404;
            }
        }
    }));

    const postUpdateService = await import('../../../services/postServices/postUpdateService.js');
    updatePostById = postUpdateService.updatePostById;
});

describe('postUpdateService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updatePostById', () => {
        it('should update a post with provided data', async () => {
            const postId = 'post123456';
            const authorId = 'author789';
            const updateData = {
                title: 'Updated Title',
                content: 'Updated content',
                authorId: authorId,
            };

            const mockReq = {
                params: { postId },
                body: updateData
            };

            const mockPost = { _id: postId, title: 'Original Title', authorId: authorId };
            const updatedPost = { _id: postId, ...updateData };

            mockFindById.mockResolvedValue(mockPost);
            mockFindByIdAndUpdate.mockResolvedValue(updatedPost);

            const result = await updatePostById(mockReq);

            expect(mockFindById).toHaveBeenCalledWith(postId);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                postId,
                {
                    $set: {
                        title: updateData.title,
                        content: updateData.content,
                        authorId: authorId,
                        updatedAt: expect.any(Date)
                    }
                },
                {new: true, runValidators: true}
            );
            expect(result).toEqual(updatedPost);
        });

        it('should throw NotFoundError if post does not exist', async () => {
            const postId = 'nonExistentPost';

            const mockReq = {
                params: { postId },
                body: {
                    title: 'New Title',
                    authorId: 'author123'
                }
            };

            mockFindById.mockResolvedValue(null);

            await expect(updatePostById(mockReq)).rejects.toThrow('Post not found');
            expect(mockFindById).toHaveBeenCalledWith(postId);
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should maintain current author when updating other fields', async () => {
            const postId = 'post123456';
            const existingAuthorId = 'author789';
            const updateData = {
                title: 'Updated Title Only'
            };

            const mockReq = {
                params: { postId },
                body: updateData
            };

            const mockPost = {
                _id: postId,
                title: 'Original Title',
                authorId: existingAuthorId
            };
            const updatedPost = {
                _id: postId,
                title: updateData.title,
                authorId: existingAuthorId
            };

            mockFindById.mockResolvedValue(mockPost);
            mockFindByIdAndUpdate.mockResolvedValue(updatedPost);

            const result = await updatePostById(mockReq);

            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                postId,
                {
                    $set: {
                        title: updateData.title,
                        updatedAt: expect.any(Date)
                    }
                },
                {new: true, runValidators: true}
            );
            expect(result).toEqual(updatedPost);
        });

        it('should handle changing the authorId', async () => {
            const postId = 'post123456';
            const newAuthorId = 'newAuthor123';

            const mockReq = {
                params: { postId },
                body: {
                    authorId: newAuthorId
                }
            };

            const mockPost = {
                _id: postId,
                title: 'Existing Title',
                authorId: 'oldAuthor456'
            };
            const updatedPost = {
                _id: postId,
                title: 'Existing Title',
                authorId: newAuthorId
            };

            mockFindById.mockResolvedValue(mockPost);
            mockFindByIdAndUpdate.mockResolvedValue(updatedPost);

            const result = await updatePostById(mockReq);

            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                postId,
                {
                    $set: {
                        authorId: newAuthorId,
                        updatedAt: expect.any(Date)
                    }
                },
                {new: true, runValidators: true}
            );
            expect(result).toEqual(updatedPost);
        });
    });
});