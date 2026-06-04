# Weekly Workload Forecast System Backend

A Node.js & Express API backed by PostgreSQL and Prisma ORM to manage employees, tasks, and weekly workload forecasts. This service calculates employee capacity utilization and alerts managers of potential overloads.

---

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express
- **ORM**: Prisma ORM
- **Database**: PostgreSQL

---

## Getting Started

### 1. Install Dependencies

From the `backend` folder, run:

```bash
npm install
```

### 2. Configure Database Environment

Create a `.env` file in the `backend` directory (a default has been created for you):

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public"
PORT=3000
```

By default, the system is configured to connect to your local PostgreSQL server at `localhost:5432` with username `postgres` and password `admin123`.

### 3. Run Database Migrations

Generate schema migrations and apply them to the PostgreSQL database by running:

```bash
npm run prisma:migrate
```

This will create the `employees` and `tasks` tables and generate the local Prisma Client.

---

## Running the Application

### Development Mode

Start the development server with live reload via `nodemon`:

```bash
npm run dev
```

The server will start on [http://localhost:3000](http://localhost:3000).

### Production Mode

Build the TypeScript files to JavaScript and start the production server:

```bash
npm run build
npm start
```

---

## API Endpoints

### 1. Employees

- **Create Employee**
  - `POST /api/employees`
  - Body:
    ```json
    {
      "name": "Jane Doe",
      "role": "Software Engineer",
      "weeklyCapacity": 40
    }
    ```
- **Get All Employees**
  - `GET /api/employees`

### 2. Tasks

- **Create Task**
  - `POST /api/tasks`
  - Body:
    ```json
    {
      "title": "Build user auth",
      "estimatedHours": 15,
      "priority": "HIGH", // HIGH, MEDIUM, LOW
      "status": "NOT_STARTED", // NOT_STARTED, IN_PROGRESS, COMPLETED
      "dueDate": "2026-06-03", // YYYY-MM-DD
      "assignedEmployeeId": "uuid-here" // optional
    }
    ```
- **Update Task**
  - `PUT /api/tasks/:id`
  - Body (supports partial updates):
    ```json
    {
      "status": "IN_PROGRESS",
      "estimatedHours": 20
    }
    ```
- **Get All Tasks**
  - `GET /api/tasks`

### 3. Forecast

- **Get Weekly Forecast**
  - `GET /api/forecast?weekStart=2026-06-01`
  - Query Param: `weekStart` (required, in `YYYY-MM-DD` format).
  - Returns a list of capacity utilization and warning indicators for each employee for the 7-day period starting from `weekStart` (inclusive).
  - Formula: `utilization = (totalAssignedHours / weeklyCapacity) * 100` (rounded to nearest integer)
  - Warning levels:
    - **GREEN**: 0-79%
    - **YELLOW**: 80-99%
    - **RED**: 100%+
  - Sample Response:
    ```json
    [
      {
        "employeeId": "0dfb9995-a966-466d-a8f1-ccd18ba4fb9b",
        "name": "Alice Smith",
        "capacity": 40,
        "plannedHours": 40,
        "utilization": 100,
        "warning": "RED"
      }
    ]
    ```

---

## Running Integration Tests

To run the automated endpoint validation and forecast verification test suite:

```bash
npm run test:api
```
This script will wipe the database tables, insert test employees and tasks, verify constraints, check forecast results, perform updates, and assert correctness.
