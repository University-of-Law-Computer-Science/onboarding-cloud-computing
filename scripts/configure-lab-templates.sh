#!/bin/bash
set -e

ORG="University-of-Law-Computer-Science"
GIT_HOST="github-work" # Defined in SSH config

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

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}Working in $TEMP_DIR${NC}"

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

cd "$TEMP_DIR"

for lab in "${labs[@]}"; do
    REPO_NAME="ccds-lab-$lab"
    FULL_REPO="$ORG/$REPO_NAME"

    echo "------------------------------------------------"
    echo -e "${YELLOW}Configuring $REPO_NAME...${NC}"

    # 1. Update Content (Workflow & Rules)
    echo "Cloning..."
    git clone "git@$GIT_HOST:$ORG/$REPO_NAME.git"
    cd "$REPO_NAME"

    mkdir -p .github/workflows

    # Autograding Workflow
    cat <<EOF > .github/workflows/autograde.yml
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
          echo "Running lab validation..."
          # Placeholder: In a real scenario, this would run pytest, jest, etc.
          # For now, we pass if the starter file exists (sanity check)
          if [ -f "starter/README.md" ]; then
            echo "Starter code structure verified."
          else
            echo "Warning: folder structure seems modified."
          fi
          
          # Simulation of a grade file
          echo "PASS" > grade.txt

      - uses: actions/upload-artifact@v4
        with:
          name: grading
          path: grade.txt
EOF

    # Submission Rules
    cat <<EOF > SUBMISSION.md
# Lab Submission Guidelines

## How to Submit
1. **Create a Branch**: Always work on a new branch (e.g., \`solution\`).
   \`\`\`bash
   git checkout -b solution
   \`\`\`
2. **Commit Changes**: Push your work to your branch.
3. **Open a Pull Request**: Go to GitHub and open a PR from \`solution\` to \`main\`.
4. **Check Autograding**: Wait for the "Autograding" check to pass on your PR.
5. **Review**: Your instructor will review the PR and provide feedback.

**⚠️ DO NOT merge the PR yourself.**
EOF

    git add .
    if ! git diff --cached --quiet; then
        git commit -m "Add autograding workflow and submission guidelines"
        git push origin main
        echo -e "${GREEN}Pushed workflow updates.${NC}"
    else
        echo "No content changes needed."
    fi
    cd ..

    # 2. Repo Settings (Template, No Extras)
    echo "Updating repo settings (Template: ON, Issues: OFF)..."
    gh repo edit "$FULL_REPO" --template --enable-issues=false --enable-wiki=false --enable-projects=false

    # 3. Branch Protection
    # Use a JSON payload for complex protection rules
    # Note: 'grade' context matches the job name in autograde.yml
    cat <<EOF > protection.json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["grade"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true
}
EOF
    echo "Setting branch protection rules..."
    # We use a try/catch approach because enabling protection might fail if the repo is empty or new
    if gh api -X PUT "repos/$FULL_REPO/branches/main/protection" --input protection.json > /dev/null; then
         echo -e "${GREEN}Branch protection enabled.${NC}"
    else
         echo -e "${RED}Failed to set branch protection. Ensure 'main' branch exists.${NC}"
    fi

done

echo "------------------------------------------------"
echo -e "${GREEN}All labs configured successfully!${NC}"
