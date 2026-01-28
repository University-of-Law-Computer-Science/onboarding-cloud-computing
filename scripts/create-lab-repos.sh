#!/bin/bash
set -e

# Configuration
ORG="University-of-Law-Computer-Science"
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

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for gh
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) not found. Please install it.${NC}"
    exit 1
fi

# Check auth
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: You are not logged into GitHub CLI. Run 'gh auth login' first.${NC}"
    exit 1
fi

echo -e "${BLUE}Starting repository automation for organization: $ORG${NC}"

# Create a temp directory for repo setup to avoid cluttering workspace
TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}Using temporary directory: $TEMP_DIR${NC}"

# Cleanup function
cleanup() {
    echo -e "${BLUE}Cleaning up temporary files...${NC}"
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

cd "$TEMP_DIR" || exit

for lab in "${labs[@]}"; do
  REPO="ccds-lab-$lab"
  
  echo "------------------------------------------------"
  echo -e "${YELLOW}Processing $REPO...${NC}"

  # Check if repo exists
  if gh repo view "$ORG/$REPO" &> /dev/null; then
      echo -e "${GREEN}Repository $ORG/$REPO already exists. Updating structure if needed.${NC}"
  else
      # Create repo
      echo "Creating repository..."
      gh repo create "$ORG/$REPO" --$VISIBILITY --confirm
      echo -e "${GREEN}Created repository $ORG/$REPO${NC}"
  fi

  # Clone to temp dir
  echo "Cloning..."
  git clone "git@github-work:$ORG/$REPO.git"
  cd "$REPO" || exit

  # Initialize structure
  mkdir -p lab starter submission .github/workflows

  # Create standard files if they don't exist
  if [ ! -f README.md ]; then echo "# $REPO" > README.md; fi
  if [ ! -f lab/instructions.md ]; then echo "# Lab Instructions" > lab/instructions.md; fi
  if [ ! -f lab/questions.md ]; then echo "# Reflection Questions" > lab/questions.md; fi
  if [ ! -f starter/README.md ]; then echo "# Starter code" > starter/README.md; fi
  touch submission/.gitkeep

  # Write .gitignore
  cat <<EOF > .gitignore
.env
node_modules
__pycache__/
*.log
.DS_Store
EOF
  
  # Git operations
  git add .
  
  # Commit and push if there are changes
  if ! git diff --cached --quiet; then
      git commit -m "Initialize/Update lab structure"
      
      # Determine branch name (main or master)
      BRANCH=$(git rev-parse --abbrev-ref HEAD)
      git push origin "$BRANCH"
      
      echo -e "${GREEN}Pushed updates to $BRANCH.${NC}"
  else
      echo "No changes to push."
  fi

  cd ..
done

echo "------------------------------------------------"
echo -e "${GREEN}All labs processed successfully!${NC}"
