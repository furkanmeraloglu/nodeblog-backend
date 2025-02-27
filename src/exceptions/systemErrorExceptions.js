class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

export { NotFoundError, UnauthorizedError, ValidationError };