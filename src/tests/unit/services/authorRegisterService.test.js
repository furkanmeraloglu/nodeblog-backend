import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let registerNewAuthor;
let mockSave;
let mockAuthorConstructor;
let bcryptMock;

beforeAll(async () => {
    mockSave = jest.fn();
    mockAuthorConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave
    }));

    jest.unstable_mockModule('../../../models/author', () => ({
        default: mockAuthorConstructor
    }));

    bcryptMock = {
        hash: jest.fn().mockImplementation((password, saltRounds) =>
            Promise.resolve(`hashed_${password}`)
        )
    };

    jest.unstable_mockModule('bcrypt', () => ({
        hash: jest.fn().mockImplementation((password, saltRounds) =>
            Promise.resolve(`hashed_${password}`)
        ),
        default: {
            hash: jest.fn().mockImplementation((password, saltRounds) =>
                Promise.resolve(`hashed_${password}`)
            )
        }
    }));

    const authorRegisterService = await import('../../../services/authorServices/authorRegisterService');
    registerNewAuthor = authorRegisterService.registerNewAuthor;
});

describe('authorRegisterService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerNewAuthor', () => {
        it('should create a new author with hashed password', async () => {
            const authorData = {
                name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                password: 'password123'
            };

            const expectedHashedPassword = 'hashed_password123';
            mockSave.mockResolvedValue({
                ...authorData,
                password: expectedHashedPassword,
                _id: 'some-id'
            });

            const result = await registerNewAuthor(authorData);

            expect(mockAuthorConstructor).toHaveBeenCalledWith({
                name: authorData.name,
                username: authorData.username,
                email: authorData.email,
                password: expectedHashedPassword
            });
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual({
                ...authorData,
                password: expectedHashedPassword,
                _id: 'some-id'
            });
        });

        it('should use bcrypt to hash password with salt rounds of 10', async () => {
            const authorData = {
                name: 'Jane Doe',
                username: 'janedoe',
                email: 'jane@example.com',
                password: 'securepass'
            };

            mockSave.mockResolvedValue({});

            await registerNewAuthor(authorData);

            const bcryptMock = await import('bcrypt');
            expect(bcryptMock.default.hash).toHaveBeenCalledWith(authorData.password, 10);
        });

        it('should throw an error when author creation fails', async () => {
            const authorData = {
                name: 'Error User',
                username: 'erroruser',
                email: 'error@example.com',
                password: 'password'
            };

            const errorMessage = 'Duplicate email';
            mockSave.mockRejectedValue(new Error(errorMessage));

            await expect(registerNewAuthor(authorData)).rejects.toThrow(errorMessage);
        });
    });
});