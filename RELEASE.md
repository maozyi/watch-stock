# 📦 发布指南

本文档说明如何发布新版本到 GitHub Releases。

## 🚀 自动发布流程

项目已配置 GitHub Actions 自动发布流程，当推送带版本号的 tag 时会自动触发。

### 步骤

```bash
# 1. 更新版本号（在 package.json 中修改 version 字段）
# 例如：1.4.0 -> 1.5.0

# 2. 更新 CHANGELOG.md，添加新版本的更新内容

# 3. 提交版本更新
git add package.json CHANGELOG.md
git commit -m "chore: bump version to v1.5.0"

# 4. 创建并推送版本标签
git tag v1.5.0
git push origin main
git push origin v1.5.0
```

### 自动化流程

推送 tag 后，GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 安装 Node.js 环境
3. ✅ 安装 vsce 打包工具
4. ✅ 打包生成 `.vsix` 文件
5. ✅ 创建 GitHub Release
6. ✅ 上传 `.vsix` 文件到 Release
7. ✅ 自动生成安装说明

---

## 📝 手动发布流程

如果需要手动发布（例如 GitHub Actions 不可用）：

```bash
# 1. 本地打包
npm run package

# 2. 创建 Release
# 在 GitHub 仓库页面：
# - 点击 "Releases"
# - 点击 "Draft a new release"
# - 填写 Tag version（如 v1.5.0）
# - 填写 Release title（如 v1.5.0）
# - 在描述中粘贴 CHANGELOG.md 中的对应内容
# - 上传生成的 .vsix 文件
# - 点击 "Publish release"
```

---

## 🏷️ 版本号规范

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 规范：

- **主版本号（Major）**：不兼容的 API 修改
  - 例如：1.0.0 -> 2.0.0
  
- **次版本号（Minor）**：向下兼容的功能新增
  - 例如：1.4.0 -> 1.5.0
  
- **修订号（Patch）**：向下兼容的问题修正
  - 例如：1.4.0 -> 1.4.1

---

## ✅ 发布前检查清单

- [ ] 更新 `package.json` 中的 `version` 字段
- [ ] 更新 `CHANGELOG.md` 添加新版本内容
- [ ] 在本地测试插件功能正常
- [ ] 确认 `.gitignore` 正确配置，不包含不必要的文件
- [ ] 提交所有更改并推送到 main 分支
- [ ] 创建并推送版本标签
- [ ] 验证 GitHub Actions 执行成功
- [ ] 检查 Release 页面 `.vsix` 文件正确上传
- [ ] 下载 `.vsix` 测试安装

---

## ⚠️ 注意事项

1. **标签格式**：必须是 `v` + 版本号，如 `v1.5.0`
2. **版本一致性**：tag 版本号应与 `package.json` 中一致
3. **已发布版本**：已推送的 tag 不要修改或删除
4. **Release 描述**：建议从 `CHANGELOG.md` 复制对应版本内容
5. **测试安装**：发布后应下载 `.vsix` 测试能否正常安装

---

## 🔍 故障排查

### GitHub Actions 未触发？
- 检查 tag 格式是否正确（必须是 `v*.*.*`）
- 确认 `.github/workflows/release.yml` 文件存在
- 查看仓库 Actions 页面的错误日志

### 打包失败？
- 检查 `package.json` 配置是否完整
- 确认 `publisher` 字段已填写
- 本地运行 `vsce package` 测试

### 上传失败？
- 检查 GitHub Token 权限
- 确认仓库设置中 Actions 有写权限

---

## 📧 联系方式

如有问题，请提交 [Issue](https://github.com/your-username/codetrader/issues)。
