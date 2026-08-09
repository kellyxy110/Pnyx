-- Keep seeded Space taxonomy aligned with the product naming decision.
UPDATE "Space"
SET "name" = 'Web3',
    "description" = 'A thoughtful community for web3 conversations and organised knowledge.'
WHERE "slug" = 'web';

INSERT INTO "Space" ("id", "slug", "name", "description", "tags", "isFeatured", "isPublic", "createdAt", "updatedAt")
SELECT 'space_cryptocurrency', 'cryptocurrency', 'Cryptocurrency', 'A thoughtful community for cryptocurrency conversations and organised knowledge.', ARRAY[]::text[], false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Space" WHERE "slug" = 'cryptocurrency');
