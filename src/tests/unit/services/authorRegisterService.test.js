import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let registerNewAuthor;
let mockSave;
let mockAuthorConstructor;
let bcryptMock;

beforeAll(async () => {
    // Mock the Author model
    mockSave = jest.fn();
    mockAuthorConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave
    }));

    jest.unstable_mockModule('../../../models/author', () => ({
        default: mockAuthorConstructor
    }));

    // Mock bcrypt with named exports
    bcryptMock = {
        hash: jest.fn().mockImplementation((password, saltRounds) =>
            Promise.resolve(`hashed_${password}`)
        )
    };

    jest.unstable_mockModule('bcrypt', () => ({
        // Export hash as a named export
        hash: jest.fn().mockImplementation((password, saltRounds) =>
            Promise.resolve(`hashed_${password}`)
        ),
        // Also provide a default export for default import usage
        default: {
            hash: jest.fn().mockImplementation((password, saltRounds) =>
                Promise.resolve(`hashed_${password}`)
            )
        }
    }));

    // Import the service after mocking dependencies
    const authorRegisterService = await import('../../../services/authorServices/authorRegisterService');
    registerNewAuthor = authorRegisterService.registerNewAuthor;
});

describe('authorRegisterService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerNewAuthor', () => {
        it('should create a new author with hashed password', async () => {
            // Arrange
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

            // Act
            const result = await registerNewAuthor(authorData);

            // Assert
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

        // Fix the second test to properly access the mocked bcrypt function
        it('should use bcrypt to hash password with salt rounds of 10', async () => {
            // Arrange
            const authorData = {
                name: 'Jane Doe',
                username: 'janedoe',
                email: 'jane@example.com',
                password: 'securepass'
            };

            mockSave.mockResolvedValue({});

            // Act
            await registerNewAuthor(authorData);

            // Assert
            // Use the default export mock since that's what the service is using
            const bcryptMock = await import('bcrypt');
            expect(bcryptMock.default.hash).toHaveBeenCalledWith(authorData.password, 10);
        });

        it('should throw an error when author creation fails', async () => {
            // Arrange
            const authorData = {
                name: 'Error User',
                username: 'erroruser',
                email: 'error@example.com',
                password: 'password'
            };

            const errorMessage = 'Duplicate email';
            mockSave.mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(registerNewAuthor(authorData)).rejects.toThrow(errorMessage);
        });
    });
});