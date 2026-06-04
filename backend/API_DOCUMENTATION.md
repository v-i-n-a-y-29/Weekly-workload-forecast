# Weekly Workload Forecast - API Documentation

This documentation provides the details for the Backend API of the Weekly Workload Forecast application. The API is built with Node.js, Express, and Prisma ORM.

## Base URL
Default: `http://localhost:3000/api`

## Frontend Integration
- **CORS**: Enabled for all origins.
- **Content-Type**: All POST/PUT requests require `Content-Type: application/json`.
- **Response Format**: All responses are JSON.

---

## Data Models

### Employee
Represents a team member who can be assigned tasks.
- `id`: UUID (Generated)
- `name`: String (Max 100 chars, Required)
- `role`: String (Max 50 chars, Required)
- `weeklyCapacity`: Integer (Hours per week, default 40)

### Task
Represents a piece of work assigned to an employee.
- `id`: UUID (Generated)
- `title`: String (Max 150 chars, Required)
- `estimatedHours`: Decimal (Required)
- `priority`: Enum (HIGH, MEDIUM, LOW)
- `status`: Enum (NOT_STARTED, IN_PROGRESS, COMPLETED)
- `dueDate`: Date (YYYY-MM-DD, Required)
- `assignedEmployeeId`: UUID (Nullable, FK to Employee)

---

## API Endpoints

### 1. Employees

#### **GET /employees**
Fetch all employees ordered by name.
- **Response**: `200 OK`
- **Body**: Array of Employee objects.

#### **POST /employees**
Create a new employee.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "role": "Developer",
    "weeklyCapacity": 40
  }
  ```
- **Response**: `201 Created`
- **Errors**: `400 Bad Request` if validation fails.

---

### 2. Tasks

#### **GET /tasks**
Fetch all tasks ordered by due date.
- **Response**: `200 OK`
- **Body**: Array of Task objects.

#### **POST /tasks**
Create a new task.
- **Request Body**:
  ```json
  {
    "title": "Build API Docs",
    "estimatedHours": 2.5,
    "priority": "HIGH",
    "status": "NOT_STARTED",
    "dueDate": "2026-06-10",
    "assignedEmployeeId": "uuid-here" (optional)
  }
  ```
- **Response**: `201 Created`
- **Errors**:
  - `400 Bad Request`: Validation failure or invalid date format.
  - `404 Not Found`: if `assignedEmployeeId` does not exist.

#### **PUT /tasks/:id**
Update an existing task.
- **Request Body**: All fields are optional.
- **Response**: `200 OK`
- **Errors**:
  - `400 Bad Request`: Validation failure.
  - `404 Not Found`: Task or assigned employee not found.

---

### 3. Forecast

#### **GET /forecast**
Get the workload forecast for a specific week.
- **Query Parameters**:
  - `weekStart`: Required. Format `YYYY-MM-DD`. (e.g., `?weekStart=2026-06-01`).
- **Logic**:
  - Calculates the week range (7 days from `weekStart`).
  - Includes tasks that are NOT `COMPLETED` and fall within that date range.
- **Response**: `200 OK`
- **Body**:
  ```json
  [
    {
      "employeeId": "uuid",
      "name": "John Doe",
      "capacity": 40,
      "plannedHours": 15.5,
      "utilization": 39,
      "warning": "GREEN"
    }
  ]
  ```
- **Warning Levels**:
  - `RED`: Utilization >= 100%
  - `YELLOW`: Utilization >= 80%
  - `GREEN`: Utilization < 80%
- **Errors**: `400 Bad Request` if `weekStart` is missing or invalid.

---

## Enumerations

| Type | Valid Values |
| :--- | :--- |
| **Priority** | `HIGH`, `MEDIUM`, `LOW` |
| **Status** | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |

---

## Date Format
All dates should be sent and received in `YYYY-MM-DD` format (ISO 8601 subset) for consistency.
