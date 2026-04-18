ALTER TABLE "User"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "email" TEXT;

UPDATE "User"
SET
  "firstName" = COALESCE(NULLIF("ownerName", ''), "username"),
  "lastName" = '',
  "email" = CONCAT("username", '@example.local')
WHERE "firstName" IS NULL OR "lastName" IS NULL OR "email" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
