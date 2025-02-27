# Node Blog Backend

This is a simple Node.js backend project using Express.

# Node Blog Backend

A RESTful API backend for a blog platform built with Node.js and Express, featuring author authentication and post management.

## Features

- Author authentication (register, login, logout)
- Author management (CRUD operations)
- Blog post management
- Input validation
- Error handling
- Unit testing

## Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/furkanmeraloglu/node-blog-backend.git
   cd node-blog-backend

2. Install dependencies:
    ```sh 
    npm install
3. Set up environment variables: Create a `.env` file in the root directory with the following variables:
   ```sh
   PORT=3000
   JWT_SECRET=YOUR_JWT_SECRET_KEY
   DB_NAME=node-blog
   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=
4. Running the Project on local machine
    ```sh
    npm run dev
5. Run the tests
   ```sh
   npm test
6. Project structure
   ```text
   ├── src/
   │   ├── controllers/      # Route controllers
   │   │   ├── author/       # Author-related controllers
   │   │   └── post/         # Post-related controllers  
   │   ├── exceptions/       # Custom error classes
   │   ├── middleware/       # Express middleware
   │   ├── models/           # Mongoose models
   │   ├── routes/           # Express routes
   │   ├── services/         # Business logic
   │   │   ├── authorServices/
   │   │   └── postServices/
   │   ├── tests/            # Test files
   │   │   ├── unit/         # Unit tests
   │   │   └── integration/  # Integration tests
   │   └── utils/            # Utility functions
   ├── index.js              # Application entry point
   ├── package.json          # Project metadata and dependencies
   └── .env                  # Environment variables (create this file)
7. API Endpoints
   ```text
   POST /api/authors/register - Register a new author
   POST /api/authors/login - Login an author
   POST /api/authors/logout - Logout an author
   
   Authors   
   GET /api/authors - Get all authors
   GET /api/authors/:id - Get a specific author
   PUT /api/authors/:id - Update an author
   DELETE /api/authors/:id - Delete an author and their posts
   
   Posts
   GET /api/posts - Get all posts
   POST /api/posts - Create a new post
   GET /api/posts/:id - Get a specific post
   PUT /api/posts/:id - Update a post
   DELETE /api/posts/:id - Delete a post
