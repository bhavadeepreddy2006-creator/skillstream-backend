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

async function registerAndLogin(email) {
    const user = { name: "Test User", email, password: "Passw0rd!" };
    const res = await request(app).post("/auth/register").send(user);
    return { token: res.body.token, id: res.body.user.id };
}

describe("Posts", () => {
    test("creating a post requires auth", async () => {
        const res = await request(app).post("/post").send({ title: "Hello", content: "World" });
        expect(res.status).toBe(401);
    });

    test("a published post appears in the feed", async () => {
        const { token } = await registerAndLogin("creator@example.com");

        const createRes = await request(app)
            .post("/post")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "My First Post", content: "Some content here", status: "published" });

        expect(createRes.status).toBe(201);

        const feedRes = await request(app).get("/post").set("Authorization", `Bearer ${token}`);
        expect(feedRes.status).toBe(200);
        expect(feedRes.body.posts.length).toBe(1);
        expect(feedRes.body.posts[0].title).toBe("My First Post");
    });

    test("a draft is not visible to another user (404, not 403)", async () => {
        const author = await registerAndLogin("author@example.com");
        const other = await registerAndLogin("other@example.com");

        const createRes = await request(app)
            .post("/post")
            .set("Authorization", `Bearer ${author.token}`)
            .send({ title: "Draft Post", content: "Not published yet", status: "draft" });

        expect(createRes.status).toBe(201);
        const postId = createRes.body.post._id;

        const viewRes = await request(app).get(`/post/${postId}`).set("Authorization", `Bearer ${other.token}`);
        expect(viewRes.status).toBe(404);
    });

    test("only the owner can delete their post", async () => {
        const author = await registerAndLogin("owner@example.com");
        const intruder = await registerAndLogin("intruder@example.com");

        const createRes = await request(app)
            .post("/post")
            .set("Authorization", `Bearer ${author.token}`)
            .send({ title: "Owned Post", content: "Mine", status: "published" });

        const postId = createRes.body.post._id;

        const deleteRes = await request(app)
            .delete(`/post/${postId}`)
            .set("Authorization", `Bearer ${intruder.token}`);

        expect(deleteRes.status).toBe(403);
    });
});
