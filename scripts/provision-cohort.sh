#!/bin/bash
set -e

# Usage: ./provision-cohort.sh <cohort-name> <lab-name> <student-list-file>
# Example: ./provision-cohort.sh 2024-25 ccds-lab-01-virtualisation students.txt

ORG="University-of-Law-Computer-Science"
COHORT="$1"
LAB_TEMPLATE="$2"
STUDENT_LIST="$3"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$COHORT" ] || [ -z "$LAB_TEMPLATE" ] || [ -z "$STUDENT_LIST" ]; then
    echo -e "${RED}Usage: $0 <cohort> <lab-template-name> <student-list-file>${NC}"
    echo "Example: $0 2024-25 ccds-lab-01-virtualisation students.txt"
    exit 1
fi

if [ ! -f "$STUDENT_LIST" ]; then
    echo -e "${RED}Error: Student list file '$STUDENT_LIST' not found.${NC}"
    exit 1
fi

echo -e "${BLUE}Provisioning repos for cohort $COHORT using template $LAB_TEMPLATE...${NC}"

while IFS= read -r student; do
    # Skip empty lines or comments
    [[ -z "$student" || "$student" =~ ^# ]] && continue

    REPO_NAME="$COHORT-$student-$LAB_TEMPLATE"
    FULL_REPO="$ORG/$REPO_NAME"

    echo "------------------------------------------------"
    echo "User: $student | Repo: $REPO_NAME"

    # Check existence
    if gh repo view "$FULL_REPO" &>/dev/null; then
        echo -e "${YELLOW}Repo already exists, skipping creation.${NC}"
    else
        echo "Creating repository..."
        if gh repo create "$FULL_REPO" \
            --template "$ORG/$LAB_TEMPLATE" \
            --private \
            --confirm > /dev/null; then
             echo -e "${GREEN}Repo created.${NC}"
        else
             echo -e "${RED}Failed to create repo.${NC}"
             continue
        fi

        # Add collaborator
        echo "Adding $student as collaborator..."
        gh repo add-collaborator "$FULL_REPO" "$student" --permission push
    fi

done < "$STUDENT_LIST"

echo "------------------------------------------------"
echo -e "${GREEN}Provisioning complete.${NC}"
