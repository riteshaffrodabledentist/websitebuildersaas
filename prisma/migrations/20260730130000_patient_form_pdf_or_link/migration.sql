-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PatientFormKind" AS ENUM ('PDF', 'LINK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Recreate PatientForm if needed with kind + url
CREATE TABLE IF NOT EXISTS "PatientForm" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "PatientFormKind" NOT NULL DEFAULT 'PDF',
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PatientForm_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "PatientForm" ADD COLUMN "kind" "PatientFormKind" NOT NULL DEFAULT 'PDF';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PatientForm" ADD COLUMN "url" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Migrate legacy fileUrl → url if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'PatientForm' AND column_name = 'fileUrl'
  ) THEN
    EXECUTE 'UPDATE "PatientForm" SET "url" = COALESCE("url", "fileUrl") WHERE "url" IS NULL';
    EXECUTE 'ALTER TABLE "PatientForm" DROP COLUMN IF EXISTS "fileUrl"';
  END IF;
END $$;

DO $$ BEGIN
 ALTER TABLE "PatientForm" ADD CONSTRAINT "PatientForm_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
