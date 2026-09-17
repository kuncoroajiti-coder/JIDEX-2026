-- Backfill Participant profiles for existing PARTICIPANT users
INSERT INTO "participants" (
    "id",
    "userId",
    "fullName",
    "createdAt",
    "updatedAt"
)
SELECT
    'participant_' || u."id",
    u."id",
    u."name",
    u."createdAt",
    CURRENT_TIMESTAMP
FROM "users" u
LEFT JOIN "participants" p
    ON p."userId" = u."id"
WHERE u."role" = 'PARTICIPANT'
  AND p."id" IS NULL;

