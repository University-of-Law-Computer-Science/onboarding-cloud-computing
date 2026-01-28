Option C (Org-First, Classroom-Ready Implementation)
Design Principles (Important)
✅ Works without GitHub Classroom
✅ Instantly compatible with GitHub Classroom later
✅ No student admin permissions
✅ PR-only submissions enforced
✅ Autograding built-in
Phase 1 — GitHub Organisation Setup (Once)
Recommended Org Structure
github.com/your-org
│
├── lab-templates/
│   ├── ccds-lab-01-virtualisation
│   ├── ccds-lab-02-containers
│   └── ...
│
├── cohorts/
│   ├── 2024-25/
│   └── 2025-26/
│
└── scripts/
This keeps templates clean and student work isolated.
Phase 2 — Instructor Template Repos
Each lab repo should be:
Repository Settings
✅ Template repository = ON
❌ Issues / Wiki / Discussions = OFF
❌ Allow forking = OFF
✅ Require PRs before merge
✅ Require status checks
✅ Restrict pushes to main
Branch Protection Rule
Branch: main
Enable:
Require pull request
Require status checks to pass
Require branches up to date
Restrict who can push (instructors only)
This enforces PR-only submission even without Classroom.
Phase 3 — Student Repo Creation (Without Classroom)
You have two clean options here.
Option 3A — GitHub CLI Script (Recommended Now)
Students get repos created automatically and added as collaborators.
Repo Creation Script (Instructor-run)
ORG="your-org"
COHORT="2024-25"
LAB="ccds-lab-02-containers"

students=(
  "studentGitHub1"
  "studentGitHub2"
  "studentGitHub3"
)

for student in "${students[@]}"; do
  REPO="$COHORT-$student-$LAB"

  gh repo create "$ORG/$REPO" \
    --template "$ORG/lab-templates/$LAB" \
    --private \
    --confirm

  gh repo add-collaborator "$ORG/$REPO" "$student" --permission push
done
✔ No forks
✔ Full control
✔ Identical to Classroom output
✔ Easy to migrate later
Option 3B — Manual Invite (Small Cohorts Only)
You create repos from template → add student as collaborator.
(Works, but doesn’t scale well.)
Phase 4 — Enforcing PR-Only Submissions (No Classroom Needed)
Students cannot push to main.
Student Workflow
git checkout -b solution
git push origin solution
Open PR:
solution → main
Submission = Open PR
Phase 5 — Autograding (Already Classroom-Compatible)
This is the key point:
GitHub Actions works the same with or without Classroom.
Base Autograde Workflow
.github/workflows/autograde.yml
name: Autograding

on:
  pull_request:
    branches: [ main ]

jobs:
  grade:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run automated checks
        run: |
          echo "Running checks..."
          # lab-specific validation here

      - name: Record result
        run: |
          echo "PASS" > grade.txt

      - uses: actions/upload-artifact@v4
        with:
          name: grading
          path: grade.txt
Classroom later will:
Read this automatically
Display pass/fail
Aggregate grades
No changes required.
Phase 6 — Lockdown & Academic Integrity
Strongly Recommended
Require linear history
Disable force pushes
Disable branch deletion
Require signed commits (optional)
Plagiarism Strategy
Identical Actions logs = red flag
Similar commit history patterns
Later: integrate MOSS / JPlag
Phase 7 — Enabling GitHub Classroom Later (Zero Rework)
When ready:
Create Classroom
Link same org
Use same template repos
Enable auto-creation instead of script
Nothing else changes.
That’s the beauty of this setup.
Instructor Workflow Summary
Task	Tool
Create labs	Template repos
Create student repos	GitHub CLI
Submissions	Pull Requests
Validation	GitHub Actions
Marking	PR review
Scaling	GitHub Classroom (optional)
What I Can Build for You Next
I can now:
✅ Write student-facing submission rules (.md)
✅ Generate one autograde workflow per lab
✅ Create repo-creation scripts per cohort
✅ Add late submission detection
✅ Add rubric-based grading artifacts
✅ Turn this into official module policy text