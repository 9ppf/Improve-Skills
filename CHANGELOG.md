# 更新日志

本文件记录 `E:\TraeWorkToDo` 项目的版本变更历史。版本号采用语义化版本规范（MAJOR.MINOR.PATCH）。

---

## v0.3.0

**发布时间**：2026-08-13 02:43:12（北京时间）  
**最新 commit**：`b6e3d68`

### 2026-08-13 02:43:12 — `b6e3d68` feat(ai): 重构 AI 学习规划师并新增统筹计划面板

| 文件 | 更新内容 |
|---|---|
| `Workbench/ai-learning/ai-roles-hub.html` | 重构为交互式 AI 学习规划师：支持全局统筹与单科专项两种模式，自动读取 localStorage 学习进度，生成场景化提示词并支持一键复制 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 升级为统筹计划面板：新增考试倒计时、每周时间分配、重点任务清单，支持跨科目（自考 / Python / AI）统一规划 |
| `data/modules/self-study.json` | 为 5 个科目的子项新增「AI助手」入口，分别带 `subject` 参数指向单科模式 |
| `data/modules/ai-roles.json` | 所有角色入口统一指向 `ai-roles-hub.html?mode=global`，进入全局统筹模式 |
| `data/modules/ai-learning.json` | 新增「AI 学习规划师」入口，指向全局统筹模式 |
| `Workbench/此刻便是春天.html` | 重新构建，应用上述导航变更 |

### 2026-08-13 12:47:58 — `aed1f2c` docs(constraint): 增加构建后浏览器模拟器预览约束

| 文件 | 更新内容 |
|---|---|
| `项目约束总览.md` | 「新增/修改文件流程」第四步新增检查项：构建校验通过后须打开 `Workbench/此刻便是春天.html` 在浏览器模拟器中预览效果 |
| `build.py 使用说明.md` | 构建流程第 13 步增加「效果预览」：明确构建校验通过后应在浏览器模拟器中确认最终效果 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

### 2026-08-13 12:49:42 — `e8c3a1d` feat(build): build.py 支持 --open 参数自动打开浏览器预览

| 文件 | 更新内容 |
|---|---|
| `build.py` | 新增 `--open` 参数；构建校验通过后自动调用系统默认浏览器打开 `Workbench/此刻便是春天.html` |
| `build.py 使用说明.md` | 新增「构建并自动打开浏览器预览」命令说明；更新构建流程第 13 步 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

### 2026-08-13 12:55:17 — `b2e5c05` docs(handoff): 更新 AGENT_HANDOFF.md 下一阶段任务

| 文件 | 更新内容 |
|---|---|
| `AGENT_HANDOFF.md` | 重写「下一步目标」：记录 AI 学习规划师重构、统筹计划面板升级、科目 AI 助手入口、`build.py --open` 参数等本阶段完成项；更新后续建议方向与 Agent 接手命令 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

---

## v0.2.0

**发布时间**：2026-08-13 01:36:05（北京时间）  
**最新 commit**：`3aaf946`

### 2026-08-13 01:36:05 — `3aaf946` fix(ui): 知识框架页隐藏工作台级计划/内容 Tab

| 文件 | 更新内容 |
|---|---|
| `data/modules/self-study.json` | 为 5 个知识框架项添加 `"renderMode": "content"` |
| `templates/workbench.html` | `renderTabs()` 识别 `renderMode === 'content'`，跳过「计划 / 内容」切换条，直接渲染内容 iframe |
| `AGENT_HANDOFF.md` | 知识框架模块增加工作台注册约定；经验教训补充「自带 Tab 内容页需声明 renderMode」 |
| `工作台搭建总结.md` | 新增问题 10：知识框架页内部 Tab 与工作台级 Tab 叠加；更新当前状态 |
| `Workbench/此刻便是春天.html` | 重新构建，应用上述变更 |

### 2026-08-13 01:23:32 — `e6c2152` refactor(kf): 系统原理与高等数学应用知识框架页模板

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 应用统一知识框架页模板：学习计划 / 知识总览 / 第 1-6 章 Tab；章节 Tab 默认隐藏，通过完整目录章节标题跳转 |
| `Workbench/自考学习/未考科目/00023高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.html` | 应用统一模板；原页面使用 `.framework-block` 与中文章节号，已适配为 Tab 分章；生成完整目录并支持点击跳转 |

### 2026-08-13 01:17:42 — `450ed29` refactor(kf): 02324 离散数学应用知识框架页模板

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 应用统一知识框架页模板：学习计划 / 知识总览 / 第 1-9 章 Tab；章节 Tab 默认隐藏，通过完整目录章节标题跳转 |
| `.gitignore` | 新增 `*_备份_*/` 规则，忽略自动生成的备份目录 |

### 2026-08-13 00:32:10 — `8bdea36` fix: 修复扫描发现的链接断裂与损坏文件

| 文件 | 更新内容 |
|---|---|
| `Workbench/此刻便是春天.html` | 重新构建生成，同步 ai-learning.json 的 contentUrl 变更 |
| `data/modules/ai-learning.json` | 修复"完整学习路线图"的 contentUrl：`ai-learning/` → `能力提升/` |
| `工作台会话交接-20260809.md` | 删除损坏且过时的会话交接文件 |
| `文件说明.md` | 更新生成时间、移除已删除文件引用、修正黄单与清理记录 |

### 2026-08-13 00:24:59 — `197beb9` refactor: 将 data/ 移出 Workbench 并合并约束文档

| 文件 | 更新内容 |
|---|---|
| `build.py` | `DATA_DIR` 改为根目录 `data/`，清理保护路径加入 `data/` |
| `data/modules/*.json` | 从 `Workbench/data/modules/` 整体迁移到 `data/modules/` |
| `data/workbench.json` | 从 `Workbench/data/workbench.json` 迁移到 `data/workbench.json` |
| `.trae/skills/integrate_reading.py` | 注释中 `Workbench/data/` 路径改为 `data/` |
| `.trae/skills/validate_workbench.py` | 新增 Tab 结构完整性校验函数 |
| `AGENT_HANDOFF.md` | 更新目录结构、data 路径引用、核心原则 |
| `build.py 使用说明.md` | 所有 `Workbench/data/` 路径改为 `data/` |
| `版本控制规范.md` | 提交范围中 `Workbench/data/` 改为 `data/` |
| `项目约束总览.md` | 合并原 `新增文件检查清单.md` 全部内容，新增「新增/修改文件流程」章节 |
| `文件说明.md` | 更新 data 路径描述 |
| `工作台搭建总结.md` | 更新 data 路径描述 |
| `新增文件检查清单.md` | 删除（内容已并入项目约束总览.md） |
| `Workbench/自考学习/备考科目/13003数据结构与算法/...` | 应用统一 Tab 分章改造 |

### 2026-08-12 21:34:43 — `f8d100a` 补充数据结构与算法、高等数学教材例题

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13003数据结构与算法/...` | 补充 8 章教材典型例题与同步练习 |
| `Workbench/自考学习/未考科目/00023高等数学（工本）/...` | 补充 6 章教材典型例题与同步练习 |
| `AGENT_HANDOFF.md` | 追加经验教训 |
| `文件说明.md` | 更新文件描述 |

### 2026-08-12 21:12:08 — `5b734eb` feat: 离散数学知识框架补充教材例题与同步练习

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/02324离散数学/...` | 补充 9 章教材典型例题与同步练习 |

### 2026-08-12 20:24:23 — `23aa7c6` chore: 将此刻便是春天.html 纳入 Git 管理并更新相关约束

| 文件 | 更新内容 |
|---|---|
| `.gitignore` | 移除 `Workbench/此刻便是春天.html` 忽略规则 |
| `Workbench/此刻便是春天.html` | 首次纳入版本控制 |
| `AGENT_HANDOFF.md` / `build.py 使用说明.md` / `文件说明.md` / `新增文件检查清单.md` / `版本控制规范.md` | 同步更新提交范围说明 |

---

## v0.1.x

### 2026-08-12 20:18:04 — `8c4c8e9` feat: 工作台扩展为六大模块并补充自考教材与知识结构

- 工作台从单一阅读模块扩展为：能力提升、自考学习、Python 基础、AI 学习、AI 助手角色、阅读资料 六大模块
- 新增自考教材 PDF 与各科知识框架页
- 更新 self-study.json 三级导航结构

### 2026-08-11 — `7aac155` ~ `deb145c`

| Commit | 说明 |
|---|---|
| `7aac155` | docs: add handoff doc and code comments |
| `9e77d28` | refactor: optimize medium/low-risk issues in workbench toolchain |
| `bc7538d` | refactor: 优化高风险项——阅读集成模板化与主题 token 白名单 |
| `deb145c` | feat: 增加本地预览与热重载开发服务器 |

---

## 常用命令

```bash
# 查看最近 10 条提交
E:\Git\Git\cmd\git.exe log --oneline -10

# 查看某次提交具体改了什么
E:\Git\Git\cmd\git.exe show 8bdea36 --stat

# 查看某个文件的历史
E:\Git\Git\cmd\git.exe log --oneline -- data/modules/ai-learning.json
```
