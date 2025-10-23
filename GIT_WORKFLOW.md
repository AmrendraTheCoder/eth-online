# Git Workflow Guide for NIMBUS - DropPilot

## 🚀 **Current Status**
✅ **Repository synchronized successfully!**
- Local and remote branches are now in sync
- All your recent changes have been pushed to GitHub
- Ready for collaborative development

## 📋 **Daily Git Workflow**

### **Before Starting Work (Always Pull First)**
```bash
# 1. Check current status
git status

# 2. Pull latest changes from remote
git pull origin main

# 3. Verify you're on the main branch
git branch
```

### **During Development**
```bash
# 1. Check what files have changed
git status

# 2. Add specific files (recommended)
git add src/lib/lit-client.ts
git add src/lib/security.ts

# 3. Or add all changes (use carefully)
git add .

# 4. Commit with descriptive message
git commit -m "Fix TypeScript errors in Lit Protocol integration"

# 5. Push changes immediately
git push origin main
```

### **Best Practices for Commits**
```bash
# Good commit messages:
git commit -m "Fix: Resolve TypeScript any type errors in security module"
git commit -m "Feature: Add PKP wallet creation with mock implementation"
git commit -m "Refactor: Improve error handling in Lit Actions executor"
git commit -m "Docs: Add comprehensive flow documentation"

# Avoid:
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

## 🔄 **Collaborative Workflow**

### **When Working with Team Members**
```bash
# 1. Always start with pull
git pull origin main

# 2. If there are conflicts, resolve them:
git status
# Edit conflicted files
git add .
git commit -m "Resolve merge conflicts"

# 3. Push your changes
git push origin main
```

### **Branch Strategy (Optional)**
```bash
# For major features, create feature branches:
git checkout -b feature/lit-protocol-integration
# Make changes
git add .
git commit -m "Add Lit Protocol integration"
git push origin feature/lit-protocol-integration

# Merge back to main:
git checkout main
git pull origin main
git merge feature/lit-protocol-integration
git push origin main
```

## 🛠️ **Troubleshooting Common Issues**

### **Issue: "Your branch and 'origin/main' have diverged"**
```bash
# Solution 1: Rebase (recommended)
git pull origin main --rebase

# Solution 2: Merge
git pull origin main

# Then push
git push origin main
```

### **Issue: "Updates were rejected because the remote contains work"**
```bash
# Pull first, then push
git pull origin main
git push origin main
```

### **Issue: "Please commit your changes or stash them"**
```bash
# Option 1: Commit changes
git add .
git commit -m "Your commit message"
git push origin main

# Option 2: Stash changes (if you want to save for later)
git stash
git pull origin main
git stash pop
```

## 📊 **Useful Git Commands**

### **Check Repository Status**
```bash
# See current status
git status

# See commit history
git log --oneline -10

# See what files changed
git diff

# See what files are staged
git diff --cached
```

### **Undo Changes**
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (lose changes)
git reset --hard HEAD~1

# Undo changes to specific file
git checkout -- src/lib/security.ts
```

### **Clean Up**
```bash
# Remove untracked files
git clean -fd

# Reset to last commit
git reset --hard HEAD

# See what would be removed
git clean -n
```

## 🚨 **Emergency Procedures**

### **If You Accidentally Push Wrong Changes**
```bash
# 1. Revert the commit
git revert <commit-hash>

# 2. Push the revert
git push origin main
```

### **If You Need to Force Push (Use with Caution)**
```bash
# Only use if you're sure no one else is working on the repo
git push origin main --force
```

## 📝 **Commit Message Convention**

### **Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### **Examples:**
```bash
git commit -m "feat(lit-protocol): Add PKP wallet creation functionality"
git commit -m "fix(security): Resolve TypeScript any type errors"
git commit -m "docs(flow): Add comprehensive integration documentation"
git commit -m "refactor(rules): Improve rule execution performance"
```

## 🔐 **Security Best Practices**

### **Never Commit Sensitive Data**
```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo "*.log" >> .gitignore

# If you accidentally committed sensitive data:
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env.local' \
--prune-empty --tag-name-filter cat -- --all
```

### **Regular Maintenance**
```bash
# Clean up merged branches
git branch --merged | grep -v main | xargs -n 1 git branch -d

# Update remote references
git remote prune origin

# Check repository size
du -sh .git
```

## 🎯 **Quick Reference**

### **Daily Workflow:**
1. `git pull origin main`
2. Make changes
3. `git add .`
4. `git commit -m "descriptive message"`
5. `git push origin main`

### **Weekly Maintenance:**
1. `git log --oneline -20` (review recent commits)
2. `git status` (check for uncommitted changes)
3. `git remote -v` (verify remote URLs)

### **Before Major Releases:**
1. `git tag -a v1.0.0 -m "Release version 1.0.0"`
2. `git push origin v1.0.0`

---

## ✅ **Current Repository Status**
- **Remote URL:** https://github.com/AmrendraTheCoder/eth-online
- **Branch:** main
- **Status:** Up to date with remote
- **Last Push:** Successful ✅

## 🚀 **Next Steps**
1. Always pull before starting work: `git pull origin main`
2. Make your changes
3. Commit with descriptive messages
4. Push immediately: `git push origin main`
5. Repeat this cycle for smooth development

**Remember:** When in doubt, always pull first! 🔄
