# Student Enrollment System (API + UI)

A full-stack, production-quality, appropriately-scoped **Student Enrollment System** built with **Fastify**, **TypeScript**, **Drizzle ORM**, **PostgreSQL** (local, no Docker), **React**, and **TanStack Query**.

Designed with a clean, flat modular architecture inspired by NestJS conventions but without over-engineering or full DDD.

---

## Architecture & Layering

The codebase is organized into domain modules (`students`, `enrollments`, `subjects`) and shared infrastructure. Each module strictly separates concerns into five distinct layers:

```
student-enrollment/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema: students, subjects, enrollments, relations
│   │   ├── client.ts          # Drizzle + pg pool setup & test client factory
│   │   ├── seed.ts            # Seeds initial subjects, students, and enrollments
│   │   └── migrations/        # Drizzle SQL migration files
│   ├── modules/
│   │   ├── students/
│   │   │   ├── routes/students.routes.ts       # Route registration only (Fastify plugin)
│   │   │   ├── handlers/students.handlers.ts   # Thin HTTP layer: Zod parsing, status codes
│   │   │   ├── services/students.service.ts    # Drizzle DB queries & business logic (zero N+1)
│   │   │   ├── dto/students.dto.ts             # Zod schemas & TypeScript types
│   │   │   └── helpers/students.helpers.ts     # Grade ranking & query math
│   │   ├── enrollments/
│   │   │   ├── routes/enrollments.routes.ts    # Fastify route registration
│   │   │   ├── handlers/enrollments.handlers.ts
│   │   │   ├── services/enrollments.service.ts # Concurrency & unique-constraint 23505 handling
│   │   │   ├── dto/enrollments.dto.ts
│   │   │   └── helpers/enrollments.helpers.ts
│   │   └── subjects/
│   │       ├── routes/subjects.routes.ts
│   │       ├── handlers/subjects.handlers.ts
│   │       ├── services/subjects.service.ts
│   │       └── dto/subjects.dto.ts
│   ├── shared/
│   │   ├── errors.ts          # AppError classes (NotFoundError, ConflictError, ValidationError)
│   │   ├── error-handler.ts   # Fastify setErrorHandler mapping AppError & Zod → HTTP
│   │   └── pagination.ts      # Shared pagination schemas and metadata calculation
│   ├── app.ts                 # Fastify application factory
│   └── server.ts              # Server bootstrap and graceful shutdown
├── tests/
│   ├── setup.ts               # Test DB connection and TRUNCATE CASCADE beforeEach hook
│   ├── students.test.ts       # Student CRUD, pagination, and joined filter tests
│   └── enrollments.test.ts    # Enrollment happy path, 404, 400, and 409 race-condition tests
├── frontend/
│   ├── src/
│   │   ├── api/               # TanStack Query hooks (useStudents, useStudent, useEnrollStudent)
│   │   ├── components/        # FilterBar, StudentsTable, AddStudentModal, EnrollModal, Pagination
│   │   ├── pages/             # StudentsListPage, StudentDetailPage
│   │   └── types/             # Shared frontend API types
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── drizzle.config.ts
├── vitest.config.ts
├── .env.example
├── package.json
└── README.md
```

### Layer Responsibilities
- **`routes/`**: Registers endpoints with Fastify. No request parsing or business logic.
- **`handlers/`**: Validates request parameters and bodies against Zod schemas, delegates to the matching service, and maps return values to HTTP response codes. No database access.
- **`services/`**: The **only** layer with database access via Drizzle ORM. Implements domain rules, single joined queries, and error throwing (`AppError`).
- **`dto/`**: Zod schemas and inferred TypeScript types for payloads, query params, and responses.
- **`helpers/`**: Pure functions without side effects (e.g. grade threshold calculation, academic year validation).
- **`shared/`**: Centralized error hierarchy (`AppError`), global Fastify error handler, and pagination helpers.

---

## Prerequisites

- **Node.js**: `v20+` or `v24+`
- **pnpm**: `v10+` or `v11+`
- **PostgreSQL**: Local instance running on port `5432` (Homebrew, apt, or Windows native installer — no Docker required).

---

## Database Setup

1. Open `psql` with your PostgreSQL superuser or application user:

```bash
psql -U postgres
```

2. Create the development and test databases:

```sql
CREATE DATABASE student_enrollment;
CREATE DATABASE student_enrollment_test;
```

3. Configure your environment variables:

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` matches your local credentials:

```ini
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres@localhost:5432/student_enrollment
DATABASE_TEST_URL=postgresql://postgres@localhost:5432/student_enrollment_test
```

4. Run migrations:

```bash
pnpm db:migrate
```

5. (Optional) Seed initial data (seeded subjects: Mathematics, Computer Science, Physics, Literature, Chemistry):

```bash
pnpm db:seed
```

---

## Running the Application

A single command runs both the backend API and the frontend dashboard concurrently:

```bash
pnpm dev
```

- **Backend API**: `http://localhost:3000` (Health check: `http://localhost:3000/health`)
- **Frontend App**: `http://localhost:5173`

---

## Running Automated Tests

The integration test suite runs 14 tests against a **real PostgreSQL test database** (not mocked). State is cleanly reset between tests using `TRUNCATE TABLE ... CASCADE`:

```bash
pnpm test
```

### Covered Test Scenarios:
1. `POST /students`: Happy path creation returning `201` and entity ID.
2. `POST /students`: Validation failure on empty or missing name returning `400 Bad Request`.
3. `GET /students?subject=Math&minGrade=B`: Single joined query filtering students who meet or exceed the grade threshold in the specified subject.
4. `GET /students/:id`: Retrieves student with nested enrollments and subject names in one query with zero N+1.
5. `GET /students/:id`: Non-existent ID returns `404 Not Found`.
6. `DELETE /students/:id`: Happy path returns `204 No Content` and cascades deletion to enrollments.
7. `DELETE /students/:id`: Non-existent ID returns `404 Not Found`.
8. `POST /students/:id/enroll`: Happy path enrollment returning `201 Created`.
9. `POST /students/:id/enroll`: Missing student returns `404 Not Found`.
10. `POST /students/:id/enroll`: Missing subject returns `404 Not Found`.
11. `POST /students/:id/enroll`: Invalid grade or academic year returns `400 ValidationError`.
12. `POST /students/:id/enroll`: Duplicate enrollment for identical `(studentId, subjectId, year)` returns `409 ConflictError`.
13. `POST /students/:id/enroll`: Concurrent race condition test firing two simultaneous requests with `Promise.all` — one succeeds (`201`) and the other is safely rejected with `409 Conflict`.

---

## Design Decisions & Trade-offs

### 1. Cascade vs. Block on Delete
- **Decision**: `enrollments.studentId` is configured with `onDelete: "cascade"`. In contrast, `enrollments.subjectId` is configured with `onDelete: "restrict"`.
- **Rationale**: An enrollment is fundamentally bound to a student's academic record. When a student is deleted, their personal enrollments must not linger as orphan rows in the database. Deleting them atomically via cascade ensures relational integrity. On the other hand, academic subjects belong to the school catalog; deleting a subject must be blocked if active student enrollments reference it to prevent accidental destruction of course histories.

### 2. Zero N+1 Queries
- **Detail View (`GET /students/:id`)**: Uses Drizzle ORM's relational query API (`db.query.students.findFirst({ with: { enrollments: { with: { subject: true } } } })`). This translates into an optimized SQL query with joins in a single round-trip, preventing any per-enrollment lookup loops.
- **Filtered List (`GET /students?subject=...&minGrade=...`)**: Implemented via a single joined query (`students` INNER JOIN `enrollments` ON `students.id = enrollments.studentId` INNER JOIN `subjects` ON `enrollments.subjectId = subjects.id`). We apply `selectDistinctOn` and a single `count(distinct students.id)` to guarantee that students with multiple enrollments appear once and pagination counts are 100% accurate without N+1 queries.

### 3. Race-Condition Defense on Enrollments
- **The Problem**: Relying on a naive "check-then-insert" pattern (`if (await exists()) throw 409; await insert()`) is vulnerable to race conditions: two concurrent requests can both pass the existence check and subsequently attempt to insert.
- **The Solution**: We enforce a composite primary key constraint at the database level: `PRIMARY KEY (student_id, subject_id, year)`. In `enrollments.service.ts`, the database insert is wrapped in a try/catch block that catches PostgreSQL error code `23505` (`unique_violation`) and converts it to a typed `ConflictError`. Fastify's centralized error handler maps this error to an HTTP `409 Conflict`.
- **Verification**: Verified under real concurrency in `tests/enrollments.test.ts` via `Promise.all`.

### 4. Primary Key Selection (UUID vs Serial)
- **Decision**: Used `uuid` (`defaultRandom()`) for `students` and `subjects`.
- **Rationale**: UUIDs prevent sequential ID enumeration attacks, allow decentralized ID generation, and match modern microservice and API best practices.

### 5. Centralized Error Handling
- **Decision**: Built a typed `AppError` hierarchy (`NotFoundError`, `ConflictError`, `ValidationError`) in `src/shared/errors.ts` and registered Fastify's `setErrorHandler` in `src/shared/error-handler.ts`.
- **Rationale**: Keeps services and handlers clean: services throw typed domain errors without dealing with Fastify replies, handlers remain thin, and API consumers receive consistent JSON error envelopes `{ statusCode, error, message, issues? }`.

---

## Scripts Reference

| Command | Description |
|---|---|
| `pnpm dev` | Runs backend (`tsx watch`) and frontend (`vite`) concurrently |
| `pnpm dev:backend` | Runs the Fastify backend in watch mode |
| `pnpm dev:frontend` | Runs the React frontend via Vite |
| `pnpm test` | Runs the full Vitest integration suite against PostgreSQL |
| `pnpm db:migrate` | Applies Drizzle migrations to PostgreSQL |
| `pnpm db:generate` | Generates new SQL migrations from `schema.ts` |
| `pnpm db:seed` | Seeds database with initial subjects, students, and enrollments |
| `pnpm build` | Compiles TypeScript and builds frontend bundle |
