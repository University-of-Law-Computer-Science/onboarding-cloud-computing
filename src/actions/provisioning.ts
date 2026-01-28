"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createRepoFromTemplate, addCollaborator } from "@/lib/github-admin"

export async function provisionLabForCohort(cohortId: string, labTemplateName: string) {
    const session = await auth()

    if (session?.user?.role !== "staff") {
        return { error: "Unauthorized" }
    }

    // 1. Get Cohort + Students
    const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
            users: {
                where: {
                    // Only provision for students who have linked their GitHub
                    githubUsername: { not: null }
                }
            }
        }
    })

    if (!cohort) return { error: "Cohort not found" }
    if (!cohort.name) return { error: "Cohort name invalid" }

    const results = {
        total: cohort.users.length,
        success: 0,
        failed: 0,
        details: [] as string[]
    }

    // 2. Loop and Create
    for (const student of cohort.users) {
        if (!student.githubUsername) continue;

        // Construct repo name: {CohortName}-{StudentUser}-{Lab}
        // Sanitize cohort name for URL safety (spaces to dashes, etc)
        const safeCohortName = cohort.name.replace(/[^a-zA-Z0-9-]/g, '-');
        const newRepoName = `${safeCohortName}-${student.githubUsername}-${labTemplateName}`;

        results.details.push(`Processing ${student.email} -> ${newRepoName}...`);

        try {
            // A. Create Repo
            const createRes = await createRepoFromTemplate(labTemplateName, newRepoName);
            if (createRes.error) {
                // If it already exists, we might still want to ensure permission is correct
                if (createRes.error.includes("already exists") || createRes.error.includes("422")) {
                    results.details.push(`  ℹ️ Repo already exists, ensuring access...`);
                } else {
                    results.details.push(`  ❌ Create failed: ${createRes.error}`);
                    results.failed++;
                    continue;
                }
            }

            // B. Add Collaborator
            const collabRes = await addCollaborator(newRepoName, student.githubUsername, "push");
            if (collabRes.error) {
                results.details.push(`  ⚠️ Repo created but failed to add user: ${collabRes.error}`);
                results.failed++; // Count as fail or partial? Let's say fail for safety
            } else {
                // C. Record in LabSubmission
                const ORG = "University-of-Law-Computer-Science";

                // Fix: Map labTemplateName (e.g., "ccds-lab-03-cloud-models") to simple labSlug (e.g., "03-cloud-models")
                // Assumption: template name format is always "ccds-lab-{slug}" or we strip "ccds-lab-"
                const labSlug = labTemplateName.replace("ccds-lab-", "");

                await prisma.labSubmission.upsert({
                    where: {
                        userId_labSlug: {
                            userId: student.id,
                            labSlug: labSlug,
                        }
                    },
                    update: {
                        repoUrl: `https://github.com/${ORG}/${newRepoName}`,
                        status: "PROVISIONED",
                    },
                    create: {
                        userId: student.id,
                        labSlug: labSlug,
                        repoUrl: `https://github.com/${ORG}/${newRepoName}`,
                        status: "PROVISIONED",
                    }
                });

                results.details.push(`  ✅ Success`);
                results.success++;
            }

        } catch (err) {
            results.details.push(`  ❌ Exception: ${err}`);
            results.failed++;
        }
    }

    return { success: true, report: results }
}
