# 🚀 Git Quick Reference - NIMBUS DropPilot

## ⚡ **Daily Commands**

### **Start Your Day**

```bash
git pull origin main
```

### **After Making Changes**

```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

### **Check Status**

```bash
git status
```

## 🛠️ **Helper Script**

```bash
# Make it executable (one time only)
chmod +x git-helper.sh

# Use the helper
./git-helper.sh pull    # Pull latest changes
./git-helper.sh push    # Add, commit, and push
./git-helper.sh status
```

## 🚨 **Emergency Commands**

### **If Git Says "Diverged"**

```bash
git pull origin main --rebase
git push origin main
```

### **If Git Says "Updates Rejected"**

```bash
git pull origin main
git push origin main
```

### **Undo Last Commit (Keep Changes)**

```bash
git reset --soft HEAD~1
```

## 📝 **Commit Message Examples**

```bash
git commit -m "feat: Add Lit Protocol integration"
git commit -m "fix: Resolve TypeScript errors"
git commit -m "docs: Update README with setup instructions"
git commit -m "refactor: Improve error handling"
```

## ✅ **Current Status**

- **Repository:** https://github.com/AmrendraTheCoder/eth-online
- **Branch:** main
- **Status:** ✅ Synchronized
- **Last Action:** Git workflow documentation added

## 🎯 **Remember**

1. **Always pull first:** `git pull origin main`
2. **Commit often:** Small, frequent commits
3. **Push immediately:** Don't let changes sit locally
4. **Use descriptive messages:** Help your future self

---

_For detailed workflow, see GIT_WORKFLOW.md_
