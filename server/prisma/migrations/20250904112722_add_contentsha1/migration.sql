/*
  Safe migration to add contentSha1 with backfill and dedupe.
  Steps:
    1) Add nullable column
    2) Backfill using sha1(content)
    3) Remove duplicates keeping latest updatedAt
    4) Make column NOT NULL and add unique index
*/

-- 1) Add nullable column first
ALTER TABLE "public"."KnowledgeEntry" ADD COLUMN "contentSha1" TEXT;

-- 2) Backfill using md5(content) (built-in, no superuser required)
UPDATE "public"."KnowledgeEntry"
SET "contentSha1" = md5("content")
WHERE "contentSha1" IS NULL;

-- 3) Dedupe rows by (title, contentSha1), keep the most recent updatedAt
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title, "contentSha1" ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC) AS rn
  FROM "public"."KnowledgeEntry"
  WHERE "contentSha1" IS NOT NULL
)
DELETE FROM "public"."KnowledgeEntry" 
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 4) Enforce NOT NULL and add unique index
ALTER TABLE "public"."KnowledgeEntry" ALTER COLUMN "contentSha1" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeEntry_title_contentSha1_key" ON "public"."KnowledgeEntry"("title", "contentSha1");
