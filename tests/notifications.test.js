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

describe("Notifications", () => {
    test("following someone creates a notification for them", async () => {
        const alice = await registerAndLogin("alice2@example.com");
        const bob = await registerAndLogin("bob2@example.com");

        const followRes = await request(app)
            .post(`/follow/${bob.id}`)
            .set("Authorization", `Bearer ${alice.token}`);
        expect(followRes.status).toBe(200);

        const notifRes = await request(app).get("/notification").set("Authorization", `Bearer ${bob.token}`);
        expect(notifRes.status).toBe(200);
        expect(notifRes.body.notifications.length).toBe(1);
        expect(notifRes.body.notifications[0].type).toBe("follow");
    });

    test("liking your own post does not create a notification", async () => {
        const alice = await registerAndLogin("alice3@example.com");

        const createRes = await request(app)
            .post("/post")
            .set("Authorization", `Bearer ${alice.token}`)
            .send({ title: "Self Like Test", content: "Content", status: "published" });

        const postId = createRes.body.post._id;

        await request(app).post(`/like/post/${postId}`).set("Authorization", `Bearer ${alice.token}`);

        const notifRes = await request(app).get("/notification").set("Authorization", `Bearer ${alice.token}`);
        expect(notifRes.body.notifications.length).toBe(0);
    });
});
