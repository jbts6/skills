# Claude Code Skills

自定义 Claude Code skills 集合。

## 安装方法

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

（请在此处添加 grill-rounds skill 的说明）

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
