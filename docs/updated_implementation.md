# Implementation Plan: Cloud Computing Labs (Org-First Model)

This document outlines the **"Option C"** implementation strategy: a robust, scalable repository model that works immediately without GitHub Classroom but retains 100% compatibility for a future switch. It has been enhanced with a comprehensive **Autograding System**.

## 1. Core Design Principles
*   ✅ **Classroom-Ready:** Zero rework to switch to GitHub Classroom later.
*   ✅ **PR-Centric:** Enforces professional workflow (Branch -> PR -> Merge).
*   ✅ **Automated:** Scripted repo creation and built-in autograding.
*   ✅ **Secure:** No student admin rights; strict branch protection.
*   ✅ **Masters-Level Content:** Rigorous learning objectives and assessment criteria.

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

## 3. Autograding System Architecture

We have implemented a **Continuous Assessment** pipeline using GitHub Actions and the central Web Application.

### 3.1. Workflow
1.  **Student Push**: Student pushes code to their repository.
2.  **GitHub Actions**: Triggers `.github/workflows/autograding.yml`.
3.  **Test Execution**: The workflow runs `tests/run_tests.sh` (customizable per lab).
4.  **Reporting**:
    *   If tests pass/fail, the workflow sends a JSON payload via **Webhook** to the Web App.
    *   Payload: `{ "repo": "...", "status": "success|failure", "github_username": "..." }`
5.  **Data Storage**: The Web App updates the `LabSubmission` record in the database.
6.  **Admin Review**: Lecturers view real-time grades in the Admin Dashboard.

### 3.2. Integration Points
*   **Webhook Endpoint**: `POST /api/webhooks/grading`
    *   Protected by `GRADING_WEBHOOK_SECRET`.
    *   Parses repo name to identify User and Lab.
*   **Database Schema**:
    *   `LabSubmission` model links `User` and `LabSlug`.
    *   Stores `grade`, `status`, `repoUrl`, and `feedback`.

## 4. Student Repository Provisioning
We use scripts to bulk-create repos for students, mimicking GitHub Classroom's behavior.

### Automation Script (Bash)
*   **Naming Convention**: `{Cohort}-{StudentUsername}-{LabName}`
*   **Action**: Creates private repo from template -> Adds student as `push` collaborator -> Injects Autograding Workflow.

```bash
# Concept
gh repo create "$ORG/$REPO" --template "$ORG/templates/$LAB" --private
gh repo add-collaborator "$ORG/$REPO" "$student" --permission push
```

## 5. Admin Dashboard
A new Admin UI is available at `/admin/submissions`.
*   **Features**:
    *   List all student submissions.
    *   Filter by Lab or Status (Graded/Failed).
    *   Direct links to Student Repositories.
    *   View timestamp of last submission.

## 6. Future Roadmap
*   **Granular Feedback**: Update `run_tests.sh` to output detailed JSON feedback (e.g., specific test case failures) and send it to the Web App.
*   **Plagiarism Detection**: Integrate Moss or similar tools in a separate pipeline.
*   **GitHub Classroom**: Switch to Classroom for provisioning; the Autograding workflow remains identical.
