-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "recipient" VARCHAR(50) NOT NULL,
    "body" TEXT NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");
