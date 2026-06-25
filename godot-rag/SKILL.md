---
name: godot-rag
description: Use when writing, debugging, or researching any Godot Engine code (GDScript, C#, shaders, scene setup). Must run before generating or discussing Godot implementation details.
compatibility: Requires Python 3.9+ and godot-rag (pip install godot-rag). Docs cover Godot 4.x (stable).
---

# godot-rag: Official Docs Before Code

## The Rule

**Before writing ANY Godot code or answering ANY Godot question, query godot-rag.**

No exceptions. Not for "simple" code. Not for "I already know this." Not for "just a quick question."

**Violating the letter of this rule is violating the spirit of this rule.**

## First Run: Verify Installation

Before your first query in any session, run:

```bash
godot-rag search "test" --limit 1
```

**If `command not found`:**
```bash
pip install godot-rag
# then retry
godot-rag search "test" --limit 1
```

**If pip install fails** (externally managed Python, no venv, etc.):
```bash
# Try with a venv
python3 -m venv ~/.venvs/godot-rag
~/.venvs/godot-rag/bin/pip install godot-rag
# Then use full path:
~/.venvs/godot-rag/bin/godot-rag search "test" --limit 1
```

**If still failing after install attempts:** Tell the user godot-rag is unavailable and proceed with caution — state explicitly that your answers may be version-inaccurate.

## How to Query

```bash
godot-rag search "your search query" --limit 5
```

**For machine-readable output (preferred when parsing results):**
```bash
godot-rag search "your search query" --json --limit 5
```

## Query Strategy

**Start specific, broaden if needed:**

| Situation | Good first query | If no results, try |
|-----------|-----------------|-------------------|
| Know the class | `"CharacterBody3D"` | `"physics body"` |
| Know the method | `"Node.add_child"` | `"add child scene tree"` |
| Know the concept | `"2D pathfinding"` | `"NavigationAgent"` |
| Know the error | `"invalid call nonexistent function"` | the class name involved |
| Only know the problem | `"spawn enemies timer"` | `"Timer"` then `"PackedScene"` |

**Multiple queries are fine.** One query rarely covers everything. Query the class, then query the specific method/property you need.

**Use `--json` when you need to:**
- Parse results programmatically
- Read multiple results efficiently
- Extract specific fields (symbol, breadcrumb, text)

## Reading Results

Each result has:
- `score` — higher = more relevant (100 = exact symbol match)
- `chunk_type` — `class_summary`, `method`, `property`, `signal`, `enum`, `constant`, `tutorial_section`
- `symbol` — the API symbol (e.g. `Timer.start`)
- `text` — the actual documentation content

**When docs conflict with your knowledge, the docs win.** Always. If the text says `start()` takes no arguments, it takes no arguments — even if you remember otherwise. Your training data is stale; the docs are not. Do not hedge ("the docs say X, but I believe Y"). Just use X.

## No Results Found

If `godot-rag search` returns nothing:

1. **Try broader terms** — `"physics"` instead of `"3D rigid body collision detection"`
2. **Try the class name alone** — `"Node"` instead of `"Node.get_children_filter"`
3. **Try synonyms** — `"remove"` vs `"delete"` vs `"free"`
4. **If still nothing:** Tell the user "I couldn't find this in the official docs" and proceed with a clear disclaimer. **Do not silently guess.**

## When to Query

| Situation | Query before... |
|-----------|----------------|
| Writing new GDScript | Any code generation |
| Debugging existing code | Suggesting fixes |
| Explaining a Godot concept | Giving explanations |
| Reviewing Godot code | Making suggestions |
| Setting up scenes/nodes | Describing setup steps |
| Configuring exports/properties | Recommending values |
| User asks "how do I..." | Answering |

## Red Flags — STOP and Query

- "I know the Timer API, let me just write it"
- "This is straightforward, no need to look it up"
- "I've done this before, here's the code"
- "The basic approach is..." (without citing docs)
- Writing GDScript before any `godot-rag search` call in the conversation
- Quoting API signatures from memory

**All of these mean: Stop. Run `godot-rag search` first.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I know this API well" | Godot 4.x changed many APIs. Your knowledge may be stale. |
| "It's just a simple Timer" | Even Timer has version-specific behavior. Query it. |
| "Querying slows me down" | `godot-rag search` takes <1 second. Wrong code takes hours to debug. |
| "The user wants a fast answer" | A wrong fast answer is worse than a correct slightly-slower answer. |
| "I'll query if I get stuck" | By then you've already written wrong code. Query first. |
| "This is a concept, not code" | Concepts are documented too. Query them. |
| "It's a basic pattern" | Basic patterns change between versions. Query them. |
| "No results, I'll just guess" | Guessing without docs is how bugs happen. Say you don't know. |

## Examples

**Before writing a timer script:**
```bash
godot-rag search "Timer" --limit 3
godot-rag search "SceneTree.create_timer" --limit 3
```

**Before using CharacterBody3D:**
```bash
godot-rag search "CharacterBody3D" --limit 5
godot-rag search "CharacterBody3D.move_and_slide" --limit 3
```

**Before explaining signals:**
```bash
godot-rag search "signal connection GDScript" --limit 5
```

**Debugging an error — search the class involved:**
```bash
godot-rag search "Area2D.body_entered" --json --limit 3
```

## Installation

```bash
pip install godot-rag
```

The database is bundled with the package — no extra setup needed.

If your environment blocks system-wide pip:
```bash
python3 -m venv ~/.venvs/godot-rag
~/.venvs/godot-rag/bin/pip install godot-rag
```

**Note:** godot-rag docs track the **stable** Godot branch. If you're using an older Godot version, some APIs may differ.
