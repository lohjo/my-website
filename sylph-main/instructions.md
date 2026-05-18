# Daily Portfolio Update — Workflow Specification

**Trigger:** `/daily` slash command (`.claude/commands/daily.md`)
**End state:** Changed `.mdx` files committed and pushed to `origin/master` on `lohjo/my-website`.
**Working directory for all shell commands:** repo root (`/home/user/my-website` or wherever the repo is cloned).

## Hard rules (never violate)

- Never commit `.env`, files containing `API_KEY`, `SECRET`, `password=`, bearer tokens, or private keys. Strip any such strings from proposed bullets and warn the user.
- Never force-push (`--force`, `--force-with-lease`) to any branch.
- Never amend a pushed commit.
- Never skip pre-commit hooks (`--no-verify`). If a hook fails, fix the root cause and create a new commit.
- Never touch `time.created` or `time.updated` in frontmatter — `scripts/update-mdx-timestamps.cjs` rewrites those from FS timestamps automatically at `pnpm build`. Editing the file is enough to bump `mtime`.
- Stage only the specific `.mdx` files changed — never `git add -A` or `git add .` (protects `venv/`, `.env`, unrelated work-in-progress).
- Abort on merge conflict — do not resolve automatically. Leave staged changes intact and report to the user.

---

## Step 1 — Pre-flight

Before gathering data, verify the working tree is clean:

```
git status --short
```

If any tracked files have unstaged changes or staged-but-uncommitted changes, **abort** and tell the user:
> "Working tree is dirty. Please stash or commit your changes before running /daily."

---

## Step 2 — Data gathering (run all four in parallel)

### 2a. Git activity (today)

```bash
git log --since="midnight" --pretty=format:"%h %s" --name-only
git diff --stat $(git log --since=midnight --pretty=format:"%h" | tail -1)^..HEAD 2>/dev/null || true
```

Collect: commit hashes, commit messages, list of files touched. If no commits since midnight, record that.

### 2b. Claude chat history (today)

Scan the JSONL project directory for this repo. The path on the user's machine is typically one of:
- `~/.claude/projects/*/` (Linux/macOS)
- `C:\Users\<User>\.claude\projects\C--Users-<User>-Projects-GitHub-my-website\` (Windows)

Use `find` (Linux) or equivalent to locate `.jsonl` files whose `mtime` is ≥ today midnight:

```bash
find ~/.claude/projects -name "*.jsonl" -newer /tmp/midnight_marker 2>/dev/null
```

Create the marker if needed: `touch -t $(date +%Y%m%d)0000 /tmp/midnight_marker`.

For each found file, read lines and extract:
- `role:"user"` → content string
- `role:"assistant"` → tool-call summaries (tool name + brief description if present)

Cap at the **20 most substantive user turns** (skip short acks like "ok", "yes", "thanks", lines under 10 characters).

If the project JSONL directory cannot be located, continue without chat data and note the gap.

### 2c. Memory diffs (today)

Check for a memory directory for this project:

```bash
ls ~/.claude/projects/*/memory/*.md 2>/dev/null | head -20
```

For each memory file found, check `stat` mtime. If modified today, read the file. Filter to memories whose content includes keywords: `project`, `feedback`, `decision`, `built`, `learned`, `changed`, `added`, `fixed`. These carry the most portfolio-relevant signal.

If memories are git-tracked, use:
```bash
git log --since=midnight --name-only -- path/to/memory/
```

### 2d. User notes (interactive — do this after auto-gather, before synthesis)

Prompt the user exactly once:
> "Anything else from today worth adding to the portfolio? (Press Enter to skip.)"

Capture free-form text. Mix into synthesis alongside gathered data.

---

## Step 3 — Synthesis: map activity to posts

### 3a. Build post index

Read every `.mdx` in the three sections (run in parallel):
- `sylph-main/app/(posts)/projects/posts/`
- `sylph-main/app/(posts)/research/posts/`
- `sylph-main/app/(posts)/writing/posts/`

For each post, extract from frontmatter: `title`, `tags[]`, `summary`, `seo.description`. Build a keyword set per post by tokenising these fields (lowercase, strip punctuation, split on spaces/hyphens).

Current posts (as of last sync — always re-read from disk, this list may be stale):