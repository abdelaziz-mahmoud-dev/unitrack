const { describe, it, before, after, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const db = require("./db");
const app = require("../src/app");
const {
  registerUser,
  authHeader,
  createUniversity,
  createApplication,
} = require("./helpers");

before(db.connect);
afterEach(db.clear);
after(db.close);

const setStatus = (token, id, status) =>
  request(app)
    .patch(`/api/applications/${id}`)
    .set(authHeader(token))
    .send({ status });

describe("Applications", () => {
  it("starts as planned", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);

    const res = await request(app)
      .post("/api/applications")
      .set(authHeader(token))
      .send({ university: uni._id, notes: "Need a motivation letter" });

    assert.equal(res.status, 201);
    assert.equal(res.body.status, "planned");
  });

  it("rejects an application for someone else's university", async () => {
    const a = await registerUser();
    const b = await registerUser({ email: "other@example.com" });
    const uni = await createUniversity(a.token);

    const res = await request(app)
      .post("/api/applications")
      .set(authHeader(b.token))
      .send({ university: uni._id });

    assert.equal(res.status, 404);
  });

  it("rejects a duplicate application for the same university", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);
    await createApplication(token, uni._id);

    const res = await request(app)
      .post("/api/applications")
      .set(authHeader(token))
      .send({ university: uni._id });

    assert.equal(res.status, 409);
  });

  it("blocks an invalid status transition", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);
    const application = await createApplication(token, uni._id);

    const res = await setStatus(token, application._id, "accepted");
    assert.equal(res.status, 400);
  });

  it("follows the status flow and sets submittedAt on submit", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);
    const application = await createApplication(token, uni._id);

    const preparing = await setStatus(token, application._id, "preparing");
    assert.equal(preparing.status, 200);
    assert.equal(preparing.body.submittedAt, undefined);

    const submitted = await setStatus(token, application._id, "submitted");
    assert.equal(submitted.status, 200);
    assert.equal(submitted.body.status, "submitted");
    assert.ok(submitted.body.submittedAt);
  });

  it("filters applications by status", async () => {
    const { token } = await registerUser();
    const uni1 = await createUniversity(token, { name: "Uni One" });
    const uni2 = await createUniversity(token, { name: "Uni Two" });
    await createApplication(token, uni1._id);
    const second = await createApplication(token, uni2._id);
    await setStatus(token, second._id, "preparing");

    const res = await request(app)
      .get("/api/applications?status=preparing")
      .set(authHeader(token));

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].university.name, "Uni Two");
  });

  it("rejects an unknown status filter", async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get("/api/applications?status=abc")
      .set(authHeader(token));

    assert.equal(res.status, 400);
  });
});

describe("Documents checklist", () => {
  it("adds, completes and removes a document with progress", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);
    const application = await createApplication(token, uni._id);
    const base = `/api/applications/${application._id}/documents`;

    const added = await request(app)
      .post(base)
      .set(authHeader(token))
      .send({ name: "Motivation Letter" });
    assert.equal(added.status, 201);
    assert.deepEqual(added.body.progress, { done: 0, total: 1 });

    const docId = added.body.documents[0]._id;

    const done = await request(app)
      .patch(`${base}/${docId}`)
      .set(authHeader(token))
      .send({ done: true });
    assert.equal(done.status, 200);
    assert.deepEqual(done.body.progress, { done: 1, total: 1 });

    const removed = await request(app)
      .delete(`${base}/${docId}`)
      .set(authHeader(token));
    assert.equal(removed.status, 200);
    assert.deepEqual(removed.body.progress, { done: 0, total: 0 });
  });

  it("returns 404 for a document that does not exist", async () => {
    const { token } = await registerUser();
    const uni = await createUniversity(token);
    const application = await createApplication(token, uni._id);

    const res = await request(app)
      .patch(`/api/applications/${application._id}/documents/507f1f77bcf86cd799439011`)
      .set(authHeader(token))
      .send({ done: true });

    assert.equal(res.status, 404);
  });
});

describe("Dashboard", () => {
  it("returns stats and upcoming deadlines for the current user", async () => {
    const a = await registerUser();
    const b = await registerUser({ email: "other@example.com" });

    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const uni = await createUniversity(a.token, { deadline: nextMonth });
    await createApplication(a.token, uni._id);

    // يوزر تاني عنده تقديم، ومينفعش يظهر في أرقام الأول
    const otherUni = await createUniversity(b.token);
    await createApplication(b.token, otherUni._id);

    const res = await request(app).get("/api/dashboard").set(authHeader(a.token));

    assert.equal(res.status, 200);
    assert.equal(res.body.totalApplications, 1);
    assert.equal(res.body.byStatus.planned, 1);
    assert.equal(res.body.byStatus.accepted, 0);
    assert.equal(res.body.upcomingDeadlines.length, 1);
    assert.equal(res.body.upcomingDeadlines[0].university, "TU Munich");
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/dashboard");
    assert.equal(res.status, 401);
  });
});