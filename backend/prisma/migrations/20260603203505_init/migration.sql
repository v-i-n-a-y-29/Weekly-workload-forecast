-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "weekly_capacity" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "estimated_hours" DECIMAL(5,2) NOT NULL,
    "priority" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "due_date" DATE NOT NULL,
    "assigned_employee_id" UUID,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_employee_id_fkey" FOREIGN KEY ("assigned_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
