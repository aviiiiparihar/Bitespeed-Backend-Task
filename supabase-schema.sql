CREATE TABLE IF NOT EXISTS public."Contact" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "phoneNumber" TEXT NULL,
  "email" TEXT NULL,
  "linkedId" BIGINT NULL,
  "linkPrecedence" TEXT NOT NULL CHECK ("linkPrecedence" IN ('primary', 'secondary')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS "idx_contact_email" ON public."Contact" ("email");
CREATE INDEX IF NOT EXISTS "idx_contact_phoneNumber" ON public."Contact" ("phoneNumber");
