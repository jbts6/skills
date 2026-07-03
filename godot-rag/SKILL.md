---
name: godot-rag
description: Use when writing, debugging, or researching any Godot Engine code (GDScript, C#, shaders, scene setup). Must run before generating or discussing Godot implementation details.
compatibility: Requires Python 3.9+ and godot-rag (uv tool install godot-rag). Docs cover Godot 4.x (stable).
version: 4.7.0.post13+
---

# godot-rag: Official Docs Before Code

## The Rule

**Before writing ANY Godot code or answering ANY Godot question, query godot-rag.** No exceptions.

## First Run

```bash
godot-rag s "test" --limit 1
# If command not found: uv tool install godot-rag
```

## Query Commands

```bash
godot-rag s-class "Node.add_child"          # API docs
godot-rag s-tutorial "how to use signals"   # Tutorials
godot-rag s-engine "GDExtension"            # Engine details
godot-rag s-addon "state machine"           # Addon docs
godot-rag s-addon "state" --addon statecharts  # Filter by addon
godot-rag s "Timer"                         # All docs (no addons)
godot-rag addons                            # List indexed addons
```

Common flags: `--limit N`, `--json`, `--no-expand`, `--debug-search`

## Query Strategy

| Situation | Good first query | If no results, try |
|-----------|-----------------|-------------------|
| Know the class | `"CharacterBody3D"` | `"physics body"` |
| Know the method | `"Node.add_child"` | `"add child scene tree"` |
| Know the concept | `"2D pathfinding"` | `"NavigationAgent"` |
| Only know the problem | `"spawn enemies timer"` | `"Timer"` then `"PackedScene"` |

Multiple queries are fine. Start specific, broaden if needed.

## HyDE 增强搜索

当查询是自然语言、调试描述或场景描述时，用 HyDE（假设文档嵌入）提升搜索效果。
Agent 自动判断是否启用，无需用户触发。

### 何时启用

自动判断，符合以下任一条件时启用：
- 自然语言问题（"how to..."、"怎么..."、"why does..."）
- 调试/排错描述（"not working"、"error when..."）
- 场景/意图描述（"spawn enemies"、"save game"）
- 中文查询（无明确英文 API 名称）

跳过 HyDE 的情况（直接搜索）：
- 精确符号（"Node.add_child"、"Timer.start"）
- 单一 class 名（"Timer"、"CharacterBody3D"）
- 已含完整 API 名称（"CharacterBody3D move_and_slide"）

### 流程

Step 1 — 生成假设文档（内部推理，不输出给用户）
  把用户问题改写为一段 Godot 官方文档风格的英文文本（100-200字）
  包含你推测相关的类名、方法名、信号名、代码片段

Step 2 — 全量搜索（用假设文档的关键术语）
  godot-rag s "<关键术语>" --json --limit 8

Step 3 — 全量搜索（用原始查询）
  godot-rag s "<原始查询>" --json --limit 8

Step 4 — 合并结果
  去重（按 symbol + path），假设文档结果优先
  不截断，保留全部，由你判断哪些有用

Step 5 — 可选：根据结果做分类搜索
  需要 API 细节 → s-class
  需要教程 → s-tutorial
  需要 addon → s-addon

### 示例

用户: "怎么让角色跳跃"
Step 1: "CharacterBody3D uses velocity and move_and_slide() for
         platformer movement. Set velocity.y = jump_force in
         _physics_process when Input.is_action_just_pressed('jump')."
Step 2: godot-rag s "CharacterBody3D velocity move_and_slide jump" --json --limit 8
Step 3: godot-rag s "怎么让角色跳跃" --json --limit 8
→ 合并去重，保留全部

用户: "signal not firing after connect"
Step 1: "Signal connection uses Object.connect(). Common issues:
         signal name must match exactly, callable must be valid,
         emitter must be in scene tree. Use get_signal_list() to verify."
Step 2: godot-rag s "Object.connect signal callable get_signal_list" --json --limit 8
Step 3: godot-rag s "signal not firing after connect" --json --limit 8
→ 合并去重，保留全部

## RAG + Grep Workflow

**先 RAG，后 grep** — 两者互补，不是替代关系。

1. **RAG 先行** — 语义搜索快速定位相关文档，跨越术语变体（"collision" 能命中 "physics body"）
2. **grep 补漏** — 当 RAG 结果不够详细、或需要找精确字符串（函数名、配置项）时用 grep

| 场景 | 用 RAG | 用 grep |
|------|--------|---------|
| 模糊问题（"怎么做 X"） | ✅ | ❌ |
| 精确函数名/类名 | ✅ 初筛 | ✅ 补全 |
| 穷举所有出现位置 | ❌ | ✅ |
| 跨文档理解概念 | ✅ | ❌ |
| RAG 结果不完整 | — | ✅ 补漏 |

## Reading Results

- `score` — higher = more relevant (100 = exact symbol match)
- `chunk_type` — `class_summary`, `method`, `property`, `signal`, `enum`, `constant`, `tutorial_section`, `addon_doc`, `addon_example`, `addon_api`
- `symbol` — the API symbol (e.g. `Timer.start`)
- `text` — the actual documentation content

**When docs conflict with your knowledge, the docs win.** Always.

## Red Flags — STOP and Query

- Writing GDScript before any `godot-rag s` call in the conversation
- Quoting API signatures from memory
- "I know this API well" — Godot 4.x changed many APIs. Query it.
