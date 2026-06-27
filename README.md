# Multi-Platform AI Skills

自定义 AI 编码助手 skills 集合，支持 Claude Code、Codex 和 OpenCode。

## 安装方法

### 方法一：使用 npx（推荐）

```bash
# 交互式安装（会引导你选择 skills 和平台）
npx @jbts6/claude-skills

# 安装特定 skill 到 Claude Code
npx @jbts6/claude-skills --skill godot-rag

# 安装到所有平台
npx @jbts6/claude-skills --all --target all

# 查看可用 skills
npx @jbts6/claude-skills --list
```

**交互式模式特性**：
- 自动检测已安装的平台
- 支持多选 skills 和平台
- 显示安装摘要和确认
- 操作提示：数字选择，`a` 全选，`i` 反选，`d` 确认

### 方法二：手动下载安装

```bash
# 1. 克隆仓库到临时目录
git clone https://github.com/jbts6/skills.git /tmp/jbts6-skills

# 2. 创建 skills 目录（如果不存在）
mkdir -p ~/.claude/skills

# 3. 复制你需要的 skill
cp -r /tmp/jbts6-skills/godot-rag ~/.claude/skills/
cp -r /tmp/jbts6-skills/grill-rounds ~/.claude/skills/

# 4. 清理临时文件
rm -rf /tmp/jbts6-skills
```

**其他平台**：
```bash
# Codex
mkdir -p ~/.codex/skills
cp -r /tmp/jbts6-skills/godot-rag ~/.codex/skills/

# OpenCode
mkdir -p ~/.opencode/skills
cp -r /tmp/jbts6-skills/godot-rag ~/.opencode/skills/
```

## 支持的平台

| 平台 | Skill 目录 | 说明 |
|------|-----------|------|
| Claude Code | `~/.claude/skills/` | Anthropic 的 AI 编码助手 |
| Codex | `~/.codex/skills/` | OpenAI 的 AI 编码助手 |
| OpenCode | `~/.opencode/skills/` | 开源 AI 编码助手 |

## 操作系统支持

| 操作系统 | 状态 | 说明 |
|---------|------|------|
| macOS | ✅ | 完全支持 |
| Linux | ✅ | 完全支持 |
| Windows | ✅ | 完全支持（自动检测 Python 命令） |

**Windows 注意事项**：
- 自动使用 `python` 命令（而非 `python3`）
- 路径自动处理（使用 `%USERPROFILE%`）
- 支持 Windows Terminal 和 PowerShell

## 可用 Skills

### godot-rag

**用途**：在编写、调试或研究任何 Godot Engine 代码时使用。

**功能**：
- 搜索 Godot 官方文档（类参考、教程、引擎细节）
- 搜索 addon 文档和示例
- 按类型精确搜索（`s-class`, `s-tutorial`, `s-engine`, `s-addon`）
- 列出已索引的 addon（`addons` 命令）

**依赖**：
- Python 3.9+
- godot-rag 包：`pip install godot-rag`

**数据库覆盖**：
- 30,529 个 chunk（28,231 个 Godot 文档 + 2,298 个 addon chunk）
- 9 个 addon：dialogue_manager, doctor, gdUnit4, input_helper, limboai, phantom-camera, scene_manager, sound_manager, statecharts

**使用示例**：
```bash
# 列出可用 addon
godot-rag addons

# 搜索类参考
godot-rag s-class "Node.add_child"

# 搜索教程
godot-rag s-tutorial "how to use signals"

# 搜索 addon 文档
godot-rag s-addon "state machine" --addon statecharts

# JSON 输出（供 AI agent 使用）
godot-rag s-class "Timer" --json
```

### grill-rounds

**用途**：用于大型 GDD/设计文档的多轮、多会话审查（grill）。

**功能**：
- 跨会话的持久化审查协议
- 基于 `GRILL_BACKLOG.md` 的状态追踪
- 逐问审查节奏（一次一个子问题）
- 接受后写入的提交流程
- 每轮提交 + 哈希回填
- 子问题投票解析（`1:X;2:Y` 格式）

**适用场景**：
- 大型游戏设计文档（GDD）
- 架构决策记录（ADR）集合
- 需要多会话才能完成的设计审查
- 需要跨会话延续和审计追踪的项目

**核心协议**：
1. **打开** — 读取 `docs/GRILL_BACKLOG.md`，确认下一个候选项
2. **逐问** — 一次问一个子问题，附带推荐和权衡
3. **应用访谈语义** — 挑战术语表、模糊术语精确化、场景压力测试、代码交叉引用
4. **解析答案** — `接受` / `修正` / `写` / `1:X;2:Y`
5. **接受后写入** — 只在口头接受后才写入文档
6. **关闭轮次** — 更新 BACKLOG、提交、回填哈希

**依赖**：
- Git 仓库
- `CONTEXT.md`（术语表）
- `docs/GRILL_BACKLOG.md`（审查待办）

**文件结构**：
```
/
├── CONTEXT.md                    # 术语表
├── docs/
│   ├── GRILL_BACKLOG.md          # 审查待办
│   ├── design/                   # 玩家可见规则
│   ├── tech/                     # 技术实现
│   └── adr/                      # 架构决策记录
└── src/
```

**使用示例**：
```bash
# 在 Claude Code 中使用
/grill-rounds

# 或在对话中说明
"我有一个大型 GDD 需要多轮审查"
```

**详细文档**：
- [ADR-FORMAT.md](grill-rounds/ADR-FORMAT.md) — ADR 格式规范
- [CONTEXT-FORMAT.md](grill-rounds/CONTEXT-FORMAT.md) — CONTEXT.md 格式规范
- [README.md](grill-rounds/README.md) — 完整说明

## 更新 Skills

```bash
cd ~/.claude/skills
git pull origin main
```

## 贡献

1. Fork 本仓库
2. 创建你的 skill 目录（包含 `SKILL.md`）
3. 提交 Pull Request

## License

MIT
