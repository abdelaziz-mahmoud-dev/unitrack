const { describe, it, before, after, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const db = require("./db");
const app = require("../src/app");
const { registerUser, authHeader } = require("./helpers");

before(db.connect);
afterEach(db.clear);
after(db.close);

describe("Auth", () => {
  describe("POST /api/auth/register", () => {
    it("creates a user and returns a token without the password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Abdelaziz",
        email: "aziz@example.com",
        password: "123456",
      });

      assert.equal(res.status, 201);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, "aziz@example.com");
      assert.equal(res.body.user.password, undefined);
    });

    it("rejects a duplicate email", async () => {
      await registerUser();
      const res = await request(app).post("/api/auth/register").send({
        name: "Someone Else",
        email: "test@example.com",
        password: "123456",
      });

      assert.equal(res.status, 409);
    });

    it("rejects invalid data", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "A", email: "not-an-email", password: "123" });

      assert.equal(res.status, 400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns a token for correct credentials", async () => {
      const { credentials } = await registerUser();
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: credentials.email, password: credentials.password });

      assert.equal(res.status, 200);
      assert.ok(res.body.token);
    });

    it("rejects a wrong password", async () => {
      const { credentials } = await registerUser();
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: credentials.email, password: "wrong-password" });

      assert.equal(res.status, 401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("rejects a request without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      assert.equal(res.status, 401);
    });

    it("returns the current user with a valid token", async () => {
      const { token } = await registerUser();
      const res = await request(app).get("/api/auth/me").set(authHeader(token));

      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, "test@example.com");
    });
  });
});