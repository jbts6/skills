# Multi-Platform AI Skills

自定义 AI 编码助手 skills 集合，支持 Claude Code、Codex 和 OpenCode。

## 安装方法

### 方法零：使用 npx（最简单）

```bash
# 安装所有 skills 到 Claude Code（默认）
npx @jbts6/claude-skills --all

# 安装特定 skill
npx @jbts6/claude-skills --skill godot-rag

# 安装到特定平台
npx @jbts6/claude-skills --skill godot-rag --target codex
npx @jbts6/claude-skills --skill godot-rag --target opencode

# 安装到所有平台
npx @jbts6/claude-skills --all --target all

# 查看可用 skills
npx @jbts6/claude-skills --list
```

### 方法一：克隆整个仓库（推荐）

```bash
# 克隆到本地
git clone https://github.com/jbts6/skills.git ~/.claude/skills

# 或者如果你已经有 ~/.claude/skills 目录，可以只克隆子目录
cd ~/.claude
git remote add skills https://github.com/jbts6/skills.git
git fetch skills
git checkout skills/main -- godot-rag grill-rounds
```

### 方法二：单独安装某个 skill

```bash
# 创建 skills 目录（如果不存在）
mkdir -p ~/.claude/skills

# 克隆仓库到临时目录
git clone https://github.com/jbts6/skills.git /tmp/skills

# 复制你需要的 skill
cp -r /tmp/skills/godot-rag ~/.claude/skills/

# 清理临时文件
rm -rf /tmp/skills
```

### 方法三：使用 Git Sparse Checkout（高级）

```bash
# 创建目录并初始化
mkdir -p ~/.claude/skills
cd ~/.claude/skills
git init
git remote add origin https://github.com/jbts6/skills.git

# 启用 sparse checkout
git sparse-checkout init
git sparse-checkout set godot-rag  # 添加你需要的 skill

# 拉取代码
git pull origin main
```

## 支持的平台

| 平台 | Skill 目录 | 说明 |
|------|-----------|------|
| Claude Code | `~/.claude/skills/` | Anthropic 的 AI 编码助手 |
| Codex | `~/.codex/skills/` | OpenAI 的 AI 编码助手 |
| OpenCode | `~/.opencode/skills/` | 开源 AI 编码助手 |

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
