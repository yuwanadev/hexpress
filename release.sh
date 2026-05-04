#!/bin/bash

# Exit on error
set -e

# Ensure we are on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  echo "Error: You must be on the main or master branch to release."
  exit 1
fi

# Ensure the working directory is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Working directory is not clean. Please commit or stash your changes."
  exit 1
fi

# Ask for version type
echo "Select version type:"
select VERSION_TYPE in patch minor major; do
  if [[ -n "$VERSION_TYPE" ]]; then
    break
  else
    echo "Invalid selection. Please try again."
  fi
done

# Bump version and create tag
echo "Bumping $VERSION_TYPE version..."
npm version $VERSION_TYPE

# Push changes and tags
echo "Pushing changes and tags to remote..."
git push origin $CURRENT_BRANCH
git push origin --tags

echo "Successfully released new version!"
