CREATE TABLE "user_m2m_applications" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "clientId" TEXT UNIQUE NOT NULL,
    "audience" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
);

-- Create an index on userId for better query performance
CREATE INDEX "m2m_application_user_id_idx" ON "user_m2m_applications"("email");


