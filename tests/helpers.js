const request = require("supertest");
const app = require("../src/app");

const registerUser = async (overrides = {}) => {
  const user = {
    name: "Test User",
    email: "test@example.com",
    password: "123456",
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(user);
  return { token: res.body.token, user: res.body.user, credentials: user };
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const createUniversity = async (token, overrides = {}) => {
  const res = await request(app)
    .post("/api/universities")
    .set(authHeader(token))
    .send({
      name: "TU Munich",
      city: "Munich",
      program: "Informatics",
      deadline: "2027-01-15",
      ...overrides,
    });
  return res.body;
};

const createApplication = async (token, universityId, overrides = {}) => {
  const res = await request(app)
    .post("/api/applications")
    .set(authHeader(token))
    .send({ university: universityId, ...overrides });
  return res.body;
};

module.exports = { registerUser, authHeader, createUniversity, createApplication };