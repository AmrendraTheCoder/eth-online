#!/bin/bash

# Git Helper Script for NIMBUS - DropPilot
# Usage: ./git-helper.sh [command]

case "$1" in
    "pull")
        echo "🔄 Pulling latest changes from remote..."
        git pull origin main
        echo "✅ Pull completed!"
        ;;
    "push")
        echo "📤 Pushing changes to remote..."
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        echo "✅ Push completed!"
        ;;
    "status")
        echo "📊 Current Git status:"
        git status
        echo ""
        echo "📈 Recent commits:"
        git log --oneline -5
        ;;
    "sync")
        echo "🔄 Syncing with remote..."
        git pull origin main
        git push origin main
        echo "✅ Sync completed!"
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        git clean -fd
        git reset --hard HEAD
        echo "✅ Clean completed!"
        ;;
    *)
        echo "🚀 Git Helper for NIMBUS - DropPilot"
        echo ""
        echo "Usage: ./git-helper.sh [command]"
        echo ""
        echo "Commands:"
        echo "  pull    - Pull latest changes from remote"
        echo "  push    - Add, commit, and push changes"
        echo "  status  - Show current status and recent commits"
        echo "  sync    - Pull and push (full sync)"
        echo "  clean   - Clean untracked files and reset"
        echo ""
        echo "Examples:"
        echo "  ./git-helper.sh pull"
        echo "  ./git-helper.sh push"
        echo "  ./git-helper.sh status"
        ;;
esac
