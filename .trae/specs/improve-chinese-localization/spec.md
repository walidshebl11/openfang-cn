# OpenFang 中文本地化改进规范

## Why
当前的汉化存在三个严重问题：
1. **代码变量名被错误汉化**：如 `sidebar折叠d`、`ws已连接`、`last错误` 等，导致侧边栏和其他功能失效
2. **翻译不够通俗**：部分翻译生硬，不符合中文用户习惯
3. **大量内容未汉化**：手部工具、设置、技能、频道等页面的内容大部分仍为英文

## What Changes
- 恢复所有被错误汉化的 JavaScript 变量名和属性名
- 优化翻译，使用更通俗自然的中文表达
- 完整汉化所有页面内容，包括：
  - 手部工具页面 (hands.js)
  - 设置页面 (settings.js)
  - 技能页面 (skills.js)
  - 频道页面 (channels.js)
  - 工作流页面 (workflows.js, workflow-builder.js)
  - 调度器页面 (scheduler.js)
  - 审批页面 (approvals.js)
  - 会话页面 (sessions.js)
  - 日志页面 (logs.js)
  - 统计页面 (usage.js, analytics)
  - 向导页面 (wizard.js)
  - 概览页面 (overview.js)
  - 聊天页面 (chat.js, agents.js)

## Impact
- Affected specs: 无
- Affected code: 
  - `crates/openfang-api/static/index_body.html`
  - `crates/openfang-api/static/js/app.js`
  - `crates/openfang-api/static/js/pages/*.js` (15个文件)

## ADDED Requirements

### Requirement: 变量名保护
汉化过程必须保护以下内容不被修改：
- JavaScript 变量名（如 `sidebarCollapsed`, `wsConnected`, `lastError`）
- JavaScript 属性名（如 `$store.app.xxx`）
- Alpine.js 绑定表达式中的变量
- 函数名和方法名
- CSS 类名
- HTML 属性名（如 `x-show`, `x-text`, `@click`）

### Requirement: 翻译质量标准
翻译应遵循以下原则：
- 使用通俗易懂的表达，避免生硬直译
- 保持术语一致性（如 Agent 统一译为"智能体"）
- 符合中文用户习惯
- 保留必要的英文术语（如 API、Token、WebSocket）

### Requirement: 完整汉化范围
以下文件需要完整汉化：

#### 核心文件
- `index_body.html` - 主页面模板
- `js/app.js` - 主应用逻辑

#### 页面文件 (pages/*.js)
1. **agents.js** - 智能体列表和聊天入口
2. **chat.js** - 聊天对话界面
3. **overview.js** - 系统概览仪表板
4. **sessions.js** - 会话管理
5. **approvals.js** - 审批管理
6. **workflows.js** - 工作流列表
7. **workflow-builder.js** - 工作流构建器
8. **scheduler.js** - 定时任务调度
9. **channels.js** - 频道集成管理
10. **skills.js** - 技能管理
11. **hands.js** - 手部工具管理
12. **settings.js** - 系统设置
13. **logs.js** - 日志查看
14. **usage.js** - 使用统计
15. **wizard.js** - 设置向导

## MODIFIED Requirements
无

## REMOVED Requirements
无

## 翻译术语对照表

| 英文 | 中文翻译 | 备注 |
|------|---------|------|
| Agent | 智能体 | 核心概念 |
| Session | 会话 | 对话会话 |
| Workflow | 工作流 | 自动化流程 |
| Channel | 频道 | 通信渠道/集成 |
| Skill | 技能 | AI能力模块 |
| Hand | 手部工具 | 操作工具 |
| Approval | 审批 | 权限审批 |
| Scheduler | 调度器 | 定时任务 |
| Token | Token | 保持原文 |
| API Key | API 密钥 | |
| Provider | 提供商 | LLM提供商 |
| Model | 模型 | |
| Prompt | 提示词 | |
| Context | 上下文 | |
| Memory | 记忆 | 智能体记忆 |
| Tool | 工具 | |
| Extension | 扩展 | |
| Integration | 集成 | |
| Webhook | Webhook | 保持原文 |
| MCP | MCP | 保持原文 |
| Daemon | 守护进程 | |
| Kernel | 内核 | |
| Vault | 密钥库 | |
| Credential | 凭证 | |
| Trigger | 触发器 | |
| Cron | 定时任务 | |
| Queue | 队列 | |
| Stream | 流式 | |
| WebSocket | WebSocket | 保持原文 |
