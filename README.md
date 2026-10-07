# UniTrack

![CI](https://github.com/abdelaziz-mahmoud-dev/unitrack/actions/workflows/ci.yml/badge.svg)

A REST API to track university applications: save the universities you want to apply to, follow each application through its status, keep a documents checklist for it, and see everything on a dashboard.

Built as a learning project with a real workflow: every feature started as a GitHub Issue, was developed on its own branch, and reached `main` through a Pull Request checked by CI.

## Features

- **Auth**: register and log in with JWT, passwords hashed with bcrypt
- **Universities**: CRUD for the universities and programs you are interested in (name, city, program, deadline, website)
- **Applications**: one application per university, with a status flow and optional `?status=` filter
- **Documents checklist**: documents required for each application (CV, motivation letter, transcript...) with progress (done / total)
- **Dashboard**: applications per status, the 5 nearest upcoming deadlines, and overall documents progress, calculated with a MongoDB aggregation pipeline
- **Ownership**: every user can only see and change their own data
- **Validation**: request bodies are validated with Zod
- **Docs**: interactive Swagger UI at `/api-docs`
- **Tests + CI**: API tests run automatically on every pull request

## Application status flow

```
planned -> preparing -> submitted -> accepted
                 ^           |
                 |           +-----> rejected
              planned
```

- `planned` can move to `preparing`
- `preparing` can move back to `planned` or forward to `submitted`
- `submitted` can move to `accepted` or `rejected`
- `accepted` and `rejected` are final
- `submittedAt` is set automatically when an application becomes `submitted`

## Tech stack

- Node.js and Express 5
- MongoDB with Mongoose
- JWT (jsonwebtoken) and bcryptjs
- Zod for validation
- Swagger UI (OpenAPI 3) for documentation
- Node's built-in test runner, Supertest and mongodb-memory-server for tests
- GitHub Actions for CI

## Getting started

### Prerequisites

- Node.js 24 (the version used in CI)
- A MongoDB database: local, or a free MongoDB Atlas cluster

### Setup

```bash
git clone https://github.com/abdelaziz-mahmoud-dev/unitrack.git
cd unitrack
npm install
```

Create a `.env` file from the example and fill in your values:

```bash
cp .env.example .env
```

On Windows PowerShell use `Copy-Item .env.example .env`.

### Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/unitrack` |
| `JWT_SECRET` | Secret used to sign tokens. Use a long random string | `change_me` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |

Never commit your real `.env` file. It is already in `.gitignore`.

### Run

```bash
npm run dev     # development, restarts on changes
npm start       # production
npm test        # run the tests
```

The server starts on `http://localhost:5000`. Open `http://localhost:5000/api-docs` for the interactive documentation. To try protected endpoints there, log in, copy the token, press **Authorize** and paste it.

## API overview

All endpoints except register and login need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and get a token |
| GET | `/api/auth/me` | Current user |
| POST | `/api/universities` | Add a university |
| GET | `/api/universities` | List my universities |
| GET | `/api/universities/:id` | Get one university |
| PATCH | `/api/universities/:id` | Update a university |
| DELETE | `/api/universities/:id` | Delete a university |
| POST | `/api/applications` | Start an application |
| GET | `/api/applications` | List my applications (`?status=`) |
| GET | `/api/applications/:id` | Get one application |
| PATCH | `/api/applications/:id` | Update notes or status |
| DELETE | `/api/applications/:id` | Delete an application |
| POST | `/api/applications/:id/documents` | Add a document to the checklist |
| PATCH | `/api/applications/:id/documents/:docId` | Edit or complete a document |
| DELETE | `/api/applications/:id/documents/:docId` | Remove a document |
| GET | `/api/dashboard` | Stats and upcoming deadlines |

Full request and response details are in the Swagger UI (`/api-docs`) and in [`docs/openapi.yaml`](docs/openapi.yaml).

## Project structure

```
unitrack/
├── .github/
│   └── workflows/ci.yml     # runs the tests on every pull request
├── docs/
│   └── openapi.yaml         # OpenAPI spec used by Swagger UI
├── src/
│   ├── config/              # database connection
│   ├── models/              # Mongoose models
│   ├── routes/              # route definitions
│   ├── controllers/         # request and response handling
│   ├── services/            # business logic
│   ├── middlewares/         # auth, validation, error handling
│   ├── validations/         # Zod schemas
│   ├── utils/               # AppError, constants
│   ├── app.js               # Express app (no listen, easy to test)
│   └── server.js            # entry point
└── tests/                   # API tests
```

The code follows a layered architecture: **routes -> controllers -> services -> models**. Controllers only deal with HTTP, and all the business rules live in the services.

## Testing

```bash
npm test
```

The tests use an in-memory MongoDB (`mongodb-memory-server`), so they never touch a real database. The first run downloads a MongoDB binary, which can take a minute.

They cover auth, universities and ownership rules, applications and the status flow, the documents checklist and the dashboard.

## Workflow

- Every feature starts as a GitHub Issue
- Work happens on a branch such as `feature/auth`, never directly on `main`
- Each branch is merged through a Pull Request with `Closes #<issue>`, so the issue closes automatically
- GitHub Actions runs the tests on every pull request
- Commit messages follow the `feat:`, `fix:`, `test:`, `chore:` convention

## Author

Abdelaziz Mahmoud ([@abdelaziz-mahmoud-dev](https://github.com/abdelaziz-mahmoud-dev))