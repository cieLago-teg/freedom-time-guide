# 🚀 GitHub 推送流程

本项目**尚未初始化** git 仓库。`Dear cieLago` 醒了后,把下面命令在 PowerShell 里跑一遍即可。

## 一次性推送(推荐)

```powershell
# 1. 进入项目
cd "d:\TRAE SOLO\SOLO Fruits\梨树苗\自由时间指南灯"

# 2. 初始化 git
git init
git config user.name "Dear cieLago"
git config user.email "your@email.com"     # 改成你 GitHub 绑定的邮箱

# 3. 第一次提交
git add .
git commit -m "feat: 自由时间指南灯 v0.1 - MVP + 移动端优化 + 10 项交互修复"

# 4. 在 GitHub 网页上创建一个空仓库(freedom-time-guide),然后:
git remote add origin https://github.com/YOUR_USERNAME/freedom-time-guide.git
git branch -M main
git push -u origin main
```

## 后续日常更新

```powershell
git add .
git commit -m "fix: 修复 XXX"
git push
```

## 推荐配套

- 在 GitHub 仓库根加 `.github/workflows/ci.yml`:每次 push 自动跑 Python 冒烟 + Node 构建
- 在 README 加一个 Build 徽章:`![build](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)`
- 关联 Vercel / Netlify / Railway 即可自动部署

## 注意事项

- `.gitignore` 已包含:`node_modules/`、`dist/`、`.venv/`、`data/*.db`、`.trae/`
- 数据库文件不会被推上去(每个人重新跑会自动建表)
- `.venv/` 也不会推(virtualenv 通常 100MB+,跨平台不能复用)