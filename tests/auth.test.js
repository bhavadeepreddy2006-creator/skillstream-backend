import request from "supertest";
import app from "../app.js";
import { connectTestDB, clearTestDB, closeTestDB } from "./setup.js";

beforeAll(async () => {
    await connectTestDB();
});

afterEach(async () => {
    await clearTestDB();
});

afterAll(async () => {
    await closeTestDB();
});

const validUser = { name: "Alice Example", email: "alice@example.com", password: "Passw0rd!" };

describe("Auth", () => {
    test("registers a new user", async () => {
        const res = await request(app).post("/auth/register").send(validUser);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(validUser.email);
    });

    test("rejects registering the same email twice", async () => {
        await request(app).post("/auth/register").send(validUser);
        const res = await request(app).post("/auth/register").send(validUser);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("rejects a weak password", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ name: "Bob", email: "bob@example.com", password: "weak" });

        expect(res.status).toBe(400);
    });

    test("logs in with correct credentials", async () => {
        await request(app).post("/auth/register").send(validUser);

        const res = await request(app)
            .post("/auth/login")
            .send({ email: validUser.email, password: validUser.password });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test("rejects login with wrong password", async () => {
        await request(app).post("/auth/register").send(validUser);

        const res = await request(app)
            .post("/auth/login")
            .send({ email: validUser.email, password: "WrongPass1!" });

        expect(res.status).toBe(401);
    });

    test("GET /auth/me requires a token", async () => {
        const res = await request(app).get("/auth/me");
        expect(res.status).toBe(401);
    });
});
