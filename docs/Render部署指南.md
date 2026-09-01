# Render 部署指南 — 此刻便是春天工作台

## 一、部署前准备

### 1.1 确认 .gitignore

项目 `.gitignore` 已包含：
- `.env`（API 密钥，不进仓库）
- `__pycache__/`（Python 缓存）
- `data/*.bak-*`（损坏数据备份）

**额外建议**：把 `data/` 目录下除 `.gitkeep` 外的文件都排除，防止本地测试数据进仓库：

```gitignore
# 在 .gitignore 中添加
data/*
!data/.gitkeep
```

### 1.2 确认配置文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `render.yaml` | Render 基础设施配置 | ✅ 已创建 |
| `requirements.txt` | Python 依赖 | ✅ 已存在 |
| `dev_server.py` | 应用服务器 | ✅ 已适配 Render（支持 PORT 环境变量 + --no-watch） |

### 1.3 推送到 GitHub

```bash
cd E:\self-improvement\Improve-Skills
git add render.yaml dev_server.py
git commit -m "feat: add Render deployment config"
git push origin main
```

---

## 二、Render 控制台配置

### 2.1 方式一：Blueprint 部署（推荐，自动读取 render.yaml）

1. 登录 [render.com](https://render.com)
2. Dashboard → **New** → **Blueprint**
3. 连接 GitHub 仓库 → 选择 `Improve-Skills` 仓库
4. Render 自动读取 `render.yaml` 创建服务
5. 在环境变量中填写：
   - `DEEPSEEK_API_KEY` = `sk-你的密钥`
6. 点击 **Create** 开始构建

### 2.2 方式二：手动配置 Web Service

1. Dashboard → **New** → **Web Service**
2. 连接 GitHub 仓库 → 选择 `Improve-Skills`
3. 配置：

| 配置项 | 值 |
|--------|-----|
| Name | `improve-skills` |
| Runtime | **Python 3** |
| Region | **Singapore** |
| Branch | `main` |
| Build Command | `pip install -r requirements.txt && python build.py` |
| Start Command | `python dev_server.py --no-build --no-watch` |
| Health Check | `/api/health` |
| Instance Type | **Free** |

4. 环境变量：

| Key | Value | 说明 |
|-----|-------|------|
| `DEEPSEEK_API_KEY` | `sk-xxx` | AI 对话密钥（在控制台填，不写进代码） |

5. 点击 **Create Web Service**

---

## 三、存储卷配置

### 3.1 问题：Render 免费层没有持久存储

Render **免费层**的文件系统是临时的——每次重新部署或服务休眠后，`data/` 目录下的所有数据（答题记录、照片）都会丢失。

### 3.2 方案 A：升级到 Starter 计划（$7/月，最简单）

1. Dashboard → 点击你的 Web Service
2. Settings → **Change Plan** → **Starter** ($7/月)
3. 持久磁盘会自动挂载（`render.yaml` 已配置）
4. `data/` 目录数据在重新部署后依然保留

### 3.3 方案 B：使用外部免费存储（免费，需改代码）

如果不想付费，可以把数据存到外部服务：

#### B1. Supabase（免费 PostgreSQL）

1. 注册 [supabase.com](https://supabase.com)，创建项目
2. 在 SQL Editor 创建表：
   ```sql
   CREATE TABLE quiz_records (
     id SERIAL PRIMARY KEY,
     subject TEXT NOT NULL,
     question_id TEXT NOT NULL,
     data JSONB NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(subject, question_id)
   );

   CREATE TABLE quiz_photos (
     id SERIAL PRIMARY KEY,
     subject TEXT NOT NULL,
     question_id TEXT NOT NULL,
     data_url TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(subject, question_id)
   );
   ```
3. 在 Render 环境变量添加：
   - `DATABASE_URL` = Supabase 连接字符串
4. 改 `dev_server.py` 读写数据库代替 JSON 文件

#### B2. Cloudflare R2（免费 10GB 对象存储）

1. 注册 Cloudflare → 创建 R2 存储桶
2. 照片存为 R2 对象，JSON 记录仍存本地（或也迁移到 R2）
3. 在 Render 环境变量添加 R2 凭证
4. 改 `dev_server.py` 照片接口调用 R2 API

#### B3. GitHub Gist（免费，临时方案）

把数据存为 GitHub Gist，通过 API 读写。不推荐长期使用，仅适合极少量数据。

### 3.4 方案对比

| 方案 | 费用 | 代码改动 | 数据持久 | 推荐场景 |
|------|------|----------|----------|----------|
| Starter 计划 | $7/月 | 无 | ✅ | 最简单，个人长期使用 |
| Supabase | 免费 | 中等 | ✅ | 愿意改代码用数据库 |
| Cloudflare R2 | 免费(10GB) | 较大 | ✅ | 照片多，需对象存储 |
| GitHub Gist | 免费 | 较小 | ✅ | 临时测试，不推荐 |

---

## 四、数据库配置（可选，当前未使用）

当前项目用 JSON 文件存储，**不需要数据库**。如果未来需要迁移：

### 4.1 创建 Render PostgreSQL

1. Dashboard → **New** → **PostgreSQL**
2. 配置：
   - Name: `improve-skills-db`
   - Database: `improve_skills`
   - User: 自动生成
   - Region: 与 Web Service 一致
3. 创建后获得 **Internal Database URL**
4. 在 Web Service 环境变量添加：
   - `DATABASE_URL` = Internal Database URL

### 4.2 代码迁移

需要改 `dev_server.py` 中的存储函数：
- `atomic_write_json()` → SQL INSERT/UPDATE
- `_load_json_backup_on_corrupt()` → SQL SELECT
- 照片 dataURL → 存为 BYTEA 或 R2 引用

---

## 五、部署验证

### 5.1 基本检查

部署完成后，在浏览器打开 `https://your-app.onrender.com`：

1. 访问 `https://your-app.onrender.com/api/health`
   - 应返回 `{"status": "ok", "api_key_configured": true}`
   - `api_key_configured` 为 `false` 说明密钥没配好

2. 访问 `https://your-app.onrender.com/Workbench/此刻便是春天.html`
   - 应看到工作台页面

3. 打开练习测验 → 拍照提交 → 确认照片显示

### 5.2 跨设备同步验证

1. **手机**拍照提交一道计算题
2. **电脑**打开同一页面 → 刷新 → 确认能看到手机拍的照片
3. 反向测试：电脑拍一张 → 手机刷新查看

### 5.3 离线降级验证

1. 开手机飞行模式 → 拍照 → 确认本地正常显示
2. 关飞行模式 → 等 15 秒 → 确认自动同步到服务端
3. 电脑刷新 → 确认看到照片

---

## 六、常见问题

### Q: 免费层服务休眠后数据丢失？

A: 是的。Render 免费层在 15 分钟无请求后休眠，重新部署后文件系统重置。解决方案：
- 升级到 Starter 计划（$7/月）获得持久磁盘
- 或使用外部存储（Supabase / R2）

### Q: AI 对话功能不工作？

A: 检查：
1. `DEEPSEEK_API_KEY` 环境变量是否正确配置
2. `/api/health` 返回 `api_key_configured: true`
3. DeepSeek API 余额是否充足

### Q: 照片上传失败？

A: 检查：
1. 照片大小是否超过限制（压缩后应 < 200KB）
2. 服务端 `data/` 目录是否有写权限
3. 浏览器控制台 Network 面板查看 `/api/quiz-photo` 请求状态

### Q: 部署后页面空白？

A: 检查 `build.py` 是否在构建阶段成功执行：
1. Render 构建日志中搜索 `Writing workbench`
2. 确认 `Workbench/此刻便是春天.html` 已生成
3. 确认 `styles/` 目录下的 CSS 文件已编译

---

## 七、费用总结

| 计划 | 费用 | 包含 |
|------|------|------|
| Free | $0 | 750 小时/月，无持久存储 |
| Starter | $7/月 | 持久磁盘 1GB，不休眠，自定义域名 |
| Standard | $25/月 | 持久磁盘 50GB，更强性能 |

**推荐**：个人使用从 Free 开始测试，确认功能正常后升级 Starter 获得数据持久。
