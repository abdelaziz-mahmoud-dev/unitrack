const { describe, it, before, after, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const db = require("./db");
const app = require("../src/app");
const { registerUser, authHeader, createUniversity } = require("./helpers");

before(db.connect);
afterEach(db.clear);
after(db.close);

describe("Universities", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/universities");
    assert.equal(res.status, 401);
  });

  it("creates a university owned by the current user", async () => {
    const { token, user } = await registerUser();
    const res = await request(app)
      .post("/api/universities")
      .set(authHeader(token))
      .send({ name: "TU Munich", city: "Munich", program: "Informatics" });

    assert.equal(res.status, 201);
    assert.equal(res.body.name, "TU Munich");
    assert.equal(res.body.owner, user.id);
  });

  it("rejects invalid data", async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .post("/api/universities")
      .set(authHeader(token))
      .send({ name: "x" });

    assert.equal(res.status, 400);
  });

  it("lists only the current user's universities", async () => {
    const a = await registerUser();
    const b = await registerUser({ email: "other@example.com" });
    await createUniversity(a.token, { name: "Mine" });
    await createUniversity(b.token, { name: "Not Mine" });

    const res = await request(app).get("/api/universities").set(authHeader(a.token));

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, "Mine");
  });

  it("hides a university from other users", async () => {
    const a = await registerUser();
    const b = await registerUser({ email: "other@example.com" });
    const uni = await createUniversity(a.token);

    const read = await request(app)
      .get(`/api/universities/${uni._id}`)
      .set(authHeader(b.token));
    const edit = await request(app)
      .patch(`/api/universities/${uni._id}`)
      .set(authHeader(b.token))
      .send({ city: "Hacked" });
    const del = await request(app)
      .delete(`/api/universities/${uni._id}`)
      .set(authHeader(b.token));

    assert.equal(read.status, 404);
    assert.equal(edit.status, 404);
    assert.equal(del.status, 404);

    // ولسه موجودة عند صاحبها
    const stillThere = await request(app)
      .get(`/api/universities/${uni._id}`)
      .set(authHeader(a.token));
    assert.equal(stillThere.status, 200);
    assert.equal(stillThere.body.city, "Munich");
  });

  it("updates a university", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);

    const res = await request(app)
      .patch(`/api/universities/${uni._id}`)
      .set(authHeader(token))
      .send({ city: "Garching" });

    assert.equal(res.status, 200);
    assert.equal(res.body.city, "Garching");
    assert.equal(res.body.name, "TU Munich");
  });

  it("deletes a university", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);

    const del = await request(app)
      .delete(`/api/universities/${uni._id}`)
      .set(authHeader(token));
    const after = await request(app)
      .get(`/api/universities/${uni._id}`)
      .set(authHeader(token));

    assert.equal(del.status, 204);
    assert.equal(after.status, 404);
  });

  it("returns 400 for an invalid id", async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get("/api/universities/not-an-id")
      .set(authHeader(token));

    assert.equal(res.status, 400);
  });
});