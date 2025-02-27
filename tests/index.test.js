import request from "supertest"
import express from "express"

const app = express();

app.get('/', (req, res) => {
    res.status(200).send('Hello node-blog');
});

describe('GET /', () => {
    it('should return Hello node-blog', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Hello node-blog');
    });
});
