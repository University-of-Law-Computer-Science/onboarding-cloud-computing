# Automated Repository Creation for Cloud Computing Labs

This document describes how to fully automate the creation of Git repositories for all laboratory sessions in the **Cloud Computing and Distributed Systems Fundamentals** module.

---

## What This Automation Does

For each lab (Lab 1–10), the automation will:

- Create a Git repository
- Apply a consistent naming convention
- Generate a standard folder structure
- Add professional README files
- Include starter placeholders
- Add `.gitignore`
- Push an initial commit automatically

---

## Recommended Repository Naming Convention

```
ccds-lab-01-virtualisation
ccds-lab-02-containers
ccds-lab-03-cloud-models
ccds-lab-04-architecture
ccds-lab-05-distributed-systems
ccds-lab-06-consistency
ccds-lab-07-microservices
ccds-lab-08-kubernetes
ccds-lab-09-cicd
ccds-lab-10-observability
```

---

## Standard Repository Structure

```
.
├── README.md
├── lab/
│   ├── instructions.md
│   └── questions.md
├── starter/
│   └── README.md
├── submission/
│   └── .gitkeep
├── .gitignore
└── .github/
    └── workflows/
        └── ci.yml
```

---

## Prerequisites

- GitHub CLI installed (`gh`)
- Authenticated via `gh auth login`
- Permission to create repositories

---

## Full Automation Script (Bash)

```bash
#!/bin/bash

ORG="your-github-org-or-username"
VISIBILITY="private"

labs=(
  "01-virtualisation"
  "02-containers"
  "03-cloud-models"
  "04-architecture"
  "05-distributed-systems"
  "06-consistency"
  "07-microservices"
  "08-kubernetes"
  "09-cicd"
  "10-observability"
)

for lab in "${labs[@]}"; do
  REPO="ccds-lab-$lab"

  gh repo create "$ORG/$REPO" --$VISIBILITY --confirm
  git clone "https://github.com/$ORG/$REPO.git"
  cd "$REPO" || exit

  mkdir -p lab starter submission .github/workflows

  echo "# $REPO" > README.md
  echo "# Lab Instructions" > lab/instructions.md
  echo "# Reflection Questions" > lab/questions.md
  echo "# Starter code" > starter/README.md
  touch submission/.gitkeep

  cat <<EOF > .gitignore
.env
node_modules
__pycache__/
*.log
EOF

  git add .
  git commit -m "Initial lab structure"
  git push origin main

  cd ..
done
```

---

## Template Repository Alternative (Best Practice)

Create a template repository called `ccds-lab-template` and generate labs using:

```bash
gh repo create ccds-lab-01-virtualisation   --template your-org/ccds-lab-template   --private
```

---

## Outcome

This approach creates a scalable, professional, and repeatable lab repository ecosystem suitable for university teaching, CI/CD instruction, and GitHub Classroom workflows.
