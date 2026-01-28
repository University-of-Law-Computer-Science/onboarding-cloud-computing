# Implementation Plan: Cloud Computing Labs (Org-First Model)

This document outlines the **"Option C"** implementation strategy: a robust, scalable repository model that works immediately without GitHub Classroom but retains 100% compatibility for a future switch.

## 1. Core Design Principles
*   ✅ **Classroom-Ready:** Zero rework to switch to GitHub Classroom later.
*   ✅ **PR-Centric:** Enforces professional workflow (Branch -> PR -> Merge).
*   ✅ **Automated:** Scripted repo creation and built-in autograding.
*   ✅ **Secure:** No student admin rights; strict branch protection.

## 2. Organization Structure
We organize the GitHub Organization to keep templates clean and student work isolated.

```text
github.com/University-of-Law-Computer-Science
│
├── lab-templates/                  # "Golden Source" templates
│   ├── ccds-lab-01-virtualisation
│   ├── ccds-lab-02-containers
│   └── ...
│
├── cohorts/                        # Student repositories
│   ├── 2024-25/
│   │   └── 2024-25-studentUser-ccds-lab-01
│   └── ...
│
└── scripts/                        # Admin scripts
```

## 3. Template Repository Configuration
Each lab template (`ccds-lab-xx`) serves as the blueprint.

### Repository Settings
*   **Visibility:** Private
*   **Template Repository:** ON
*   **Features:** Disable Issues, Wikis, Projects (keep focus on code).
*   **Permissions:** Restrict pushing to `main`.

### Branch Protection Rules (`main`)
*   **Require Pull Request:** YES (Enforces submission via PR).
*   **Require Status Checks:** YES (Ensures autograding runs).
*   **Require Linear History:** YES.
*   **Admins Only:** Restrict direct pushes to instructors.

## 4. Student Repository Provisioning
We use scripts to bulk-create repos for students, mimicking GitHub Classroom's behavior.

### Automation Script (Bash)
*   **Naming Convention:** `{Cohort}-{StudentUsername}-{LabName}`
*   **Action:** Creates private repo from template -> Adds student as `push` collaborator.

```bash
# Concept
gh repo create "$ORG/$REPO" --template "$ORG/templates/$LAB" --private
gh repo add-collaborator "$ORG/$REPO" "$student" --permission push
```

## 5. Student Submission Workflow
Students cannot push directly to `main`. They must follow a professional flow:

1.  **Branch:** `git checkout -b solution`
2.  **Work:** Commit and push changes to `solution` branch.
3.  **Submit:** Open a **Pull Request (PR)** from `solution` → `main`.
4.  **Feedback:** Automated tests run; instructors review code in the PR.

## 6. Autograding (GitHub Actions)
Grading runs automatically on every PR.

*   **File:** `.github/workflows/autograde.yml`
*   **Trigger:** On `pull_request` to `main`.
*   **Details:** Runs tests, generates a grade artifact, and posts status.

## 7. Future Roadmap: Switching to GitHub Classroom
When ready to adopt GitHub Classroom, **zero rework is required**:
1.  Link Classroom to the organization.
2.  Select existing Template Repositories.
3.  Classroom handles the provisioning (replacing the script from Section 4).
4.  Grading and submissions remain identical.
