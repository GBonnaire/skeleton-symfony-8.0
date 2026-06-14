#!/bin/bash
# To execute this script, follow this commands
# $ chmod +x /var/www/app/docker/claudeai/installBmad.sh
# $ /var/www/app/docker/claudeai/installBmad.sh

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}  BMad Method Installation${NC}"
echo -e "${GREEN}=====================================${NC}\n"

# Check Node.js
if ! command_exists node; then
    echo -e "${RED}Error: Node.js is required but is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check npm / npx
if ! command_exists npx; then
    echo -e "${RED}Error: npx is required but is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npx found: $(npx --version)${NC}"

# Run BMad installation
echo -e "\n${YELLOW}Running: npx bmad-method install${NC}\n"
cd /var/www/app && npx bmad-method install
