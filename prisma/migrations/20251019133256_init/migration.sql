-- CreateEnum
CREATE TYPE "priority_level" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "period" AS ENUM ('Monthly', 'Quarterly', 'SemiAnnual', 'Annual');

-- CreateEnum
CREATE TYPE "declaration_status" AS ENUM ('Pending', 'InProgress', 'Completed', 'Overdue');

-- CreateEnum
CREATE TYPE "declaration_priority" AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "general_note_category" AS ENUM ('General', 'Meeting', 'Reminder', 'Important', 'Other');

-- CreateEnum
CREATE TYPE "reminder_type" AS ENUM ('Email', 'SMS', 'System', 'Manual');

-- CreateEnum
CREATE TYPE "reminder_recurrence" AS ENUM ('Once', 'Daily', 'Weekly', 'Monthly');

-- CreateTable
CREATE TABLE "Customers" (
    "id" SERIAL NOT NULL,
    "uid_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorized_person" TEXT,
    "tax_office" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationTypes" (
    "id" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,
    "description" TEXT,
    "default_day" INTEGER,
    "period" "period" NOT NULL DEFAULT 'Monthly',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "color_code" VARCHAR(7),
    "priority_level" "priority_level" NOT NULL DEFAULT 'Medium',

    CONSTRAINT "DeclarationTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Declarations" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "type_id" INTEGER NOT NULL,
    "period_name" VARCHAR(50) NOT NULL,
    "due_date" DATE NOT NULL,
    "completion_date" TIMESTAMP(3),
    "status" "declaration_status" NOT NULL DEFAULT 'Pending',
    "reminder_days" INTEGER NOT NULL DEFAULT 7,
    "total_amount" DECIMAL(15,2),
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "late_fee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_by" TEXT,
    "priority" "declaration_priority" NOT NULL DEFAULT 'Medium',

    CONSTRAINT "Declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationNotes" (
    "id" SERIAL NOT NULL,
    "declaration_id" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tags" TEXT,

    CONSTRAINT "DeclarationNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralNotes" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "category" "general_note_category" NOT NULL DEFAULT 'General',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reminder_date" DATE,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,

    CONSTRAINT "GeneralNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "declaration_id" INTEGER,
    "customer_id" INTEGER,
    "document_name" TEXT NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50),
    "file_size_bytes" INTEGER,
    "description" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" TEXT,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminders" (
    "id" SERIAL NOT NULL,
    "declaration_id" INTEGER,
    "customer_id" INTEGER,
    "reminder_date" TIMESTAMP(3) NOT NULL,
    "reminder_type" "reminder_type" NOT NULL DEFAULT 'System',
    "message" TEXT,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "recurrence" "reminder_recurrence" NOT NULL DEFAULT 'Once',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customers_uid_number_key" ON "Customers"("uid_number");

-- AddForeignKey
ALTER TABLE "Declarations" ADD CONSTRAINT "Declarations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Declarations" ADD CONSTRAINT "Declarations_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "DeclarationTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationNotes" ADD CONSTRAINT "DeclarationNotes_declaration_id_fkey" FOREIGN KEY ("declaration_id") REFERENCES "Declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralNotes" ADD CONSTRAINT "GeneralNotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_declaration_id_fkey" FOREIGN KEY ("declaration_id") REFERENCES "Declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminders" ADD CONSTRAINT "Reminders_declaration_id_fkey" FOREIGN KEY ("declaration_id") REFERENCES "Declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminders" ADD CONSTRAINT "Reminders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
