/*
  Warnings:

  - The required column `inviteToken` was added to the `Cohort` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cohort" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "githubTeamSlug" TEXT NOT NULL,
    "awsAcademyLink" TEXT NOT NULL,
    "inviteToken" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Cohort" ("active", "awsAcademyLink", "githubTeamSlug", "id", "name") SELECT "active", "awsAcademyLink", "githubTeamSlug", "id", "name" FROM "Cohort";
DROP TABLE "Cohort";
ALTER TABLE "new_Cohort" RENAME TO "Cohort";
CREATE UNIQUE INDEX "Cohort_inviteToken_key" ON "Cohort"("inviteToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
