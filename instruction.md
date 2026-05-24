# Daily Portfolio Update — Workflow Specification

**Trigger:** `/daily` slash command (`.claude/commands/daily.md`)  
**End state:** One commit pushed to `origin/master` on `lohjo/my-website` with targeted prose updates to affected MDX posts. No PR, no review gate.  
**Runtime date:** Resolve at invocation time — do not hardcode.

---

## Hard Rules (never violate)

- Never commit `.env`, any file containing `API_KEY`, `SECRET`, `password=`, or similar secret-like strings.
- Never `--force-push`. Never rewrite `master` history.
- Never use `--no-verify` on commits or hooks.
- Abort on unresolvable merge conflict — leave staged changes intact, report to user.
- Stage only changed/new `.mdx` files explicitly by path. Never `git add -A` or `git add .`.

---

## Step 1 — Pre-flight checks

Before gathering any data:

1. Run `git status --porcelain`. If working tree has uncommitted changes **unrelated** to MDX posts, abort and tell the user: "Working tree has uncommitted changes. Please stash or commit them first, then re-run /daily."
2. Record `TODAY` = current date in `YYYY-MM-DD` format (e.g. `2026-05-18`). Use this value everywhere the spec says `<today>`.

---

## Step 2 — Gather data (run all four sub-steps in parallel)

### 2a. Git activity (today)

```bash
# All commits since midnight local time
git log --since="midnight" --pretty=format:"%h %s" --name-only

# Change magnitude from first today's commit to HEAD (skip if no commits today)
FIRST=$(git log --since="midnight" --pretty=format:"%H" | tail -1)
[ -n "$FIRST" ] && git diff --stat ${FIRST}^..HEAD

# PRs opened today (best-effort; skip if gh not available)
gh pr list --author @me --state all --search "created:>=$(date +%Y-%m-%d)" 2>/dev/null || true

# For each PR number returned above, fetch its full description + review comments
# (replace <N> with each PR number from the list above)
gh pr view <N> --json title,body,reviews,comments 2>/dev/null || true
```

Extract from output:
- Commit hashes + subject lines
- Files touched (full repo-relative paths)
- Branch name of HEAD: `git rev-parse --abbrev-ref HEAD`
- PR titles and body text (used as additional signal in synthesis)

If HEAD is on a feature branch (not `master`), still attribute commits to their merge-target post on `master`.

### 2b. Claude chat history (today)

Try each path in order; use the first that resolves:

| Environment | Path |
|---|---|
| Windows (local) | `C:\Users\User\.claude\projects\C--Users-User-Projects-GitHub-my-website\` |
| Linux / web session | `~/.claude/projects/` — find subdirs whose name contains `my-website` |
| Fallback | Skip silently if neither resolves |

- Find `.jsonl` files inside the resolved directory with `mtime >= today midnight`.
- For each file: parse every line as JSON. Extract:
  - `role: "user"` → `content` text.
  - `role: "assistant"` with `tool_use` → summarise tool name + first 80 chars of input.
- Cap output at **20 most substantive user messages** (exclude one-word replies, "ok", "yes", etc.).
- If no directory resolves, skip this step silently — do not abort.

### 2c. Memory diffs (today)

Try each path in order:

| Environment | Path |
|---|---|
| Windows (local) | `C:\Users\User\.claude\projects\C--Users-User-Projects-GitHub-my-website\memory\` |
| Linux / web session | `~/.claude/projects/<my-website-subdir>/memory/` |

- If it is a git-tracked path: `git log --since=midnight -- <memory-dir-path>`
- Otherwise: check file `mtime` on each `*.md` in the directory.
- Extract only memories tagged `type: project` or `type: feedback`. Ignore others to reduce noise.
- If directory does not exist or is inaccessible, skip silently.

### 2d. User notes (interactive — do this last, after 2a–2c resolve)

Ask the user exactly:

> "Anything else from today worth adding to the portfolio? (Press Enter to skip.)"

Accept free-form text. Incorporate into synthesis alongside gathered data.  
If the user presses Enter with no input, proceed with empty user notes.

---

## Step 3 — Synthesis: map activity → posts

### 3a. Build a keyword index of existing posts

For each post listed below, read its `.mdx` frontmatter (`title`, `tags`, `summary`) to build a live index. Do not hardcode keywords — derive them at runtime.

**Known posts at time of writing** (re-verify at runtime by listing the `posts/` dirs):

| Section | Slug | Path |
|---|---|---|
| projects | contextguard | `sylph-main/app/(posts)/projects/posts/contextguard.mdx` |
| projects | lifeline | `sylph-main/app/(posts)/projects/posts/lifeline.mdx` |
| projects | sentinel | `sylph-main/app/(posts)/projects/posts/sentinel.mdx` |
| research | breakthrough-curve-modelling | `sylph-main/app/(posts)/research/posts/breakthrough-curve-modelling.mdx` |
| research | co2-adsorption-scope | `sylph-main/app/(posts)/research/posts/co2-adsorption-scope.mdx` |
| writing | presenting-to-the-dpm | `sylph-main/app/(posts)/writing/posts/presenting-to-the-dpm.mdx` |
| writing | sail-cross-cultural-engineering | `sylph-main/app/(posts)/writing/posts/sail-cross-cultural-engineering.mdx` |
| writing | teaching-ev3-robotics | `sylph-main/app/(posts)/writing/posts/teaching-ev3-robotics.mdx` |

### 3b. Matching algorithm

For each commit/chat insight, score it against every post using these signals:
- **File path tokens**: repo-relative paths touched by the commit (e.g. `contextguard` in path → strong signal).
- **Commit message tokens**: subject line words.
- **Branch name tokens**: tokenise on `/`, `-`, `_`.
- **Chat content tokens**: project names, tool names, keywords from the user prompts.

Score threshold: **≥ 0.4** normalised overlap with a post's keyword set → match.

Rules:
- Multiple commits matching the same post → consolidate into one update block for that post.
- Chat-only insights (no commits) that match a research or writing post → still update that post.
- A commit touching no post above 0.4 **and** introducing a clearly new domain → flag for new post (see Step 3c).

**Guard:** If more than 5 posts are matched, stop and ask the user:  
> "Matched N posts: [list slugs]. This seems broad. Confirm? (y/n)"  
Only proceed on `y`.

### 3c. New post path (rare)

If any commit clearly introduces a new project/research domain with no match above:
1. Stop and ask: "Commit `<hash>` (`<subject>`) doesn't match any existing post. Create a new one? If yes, which section (projects / research / writing) and what title?"
2. On confirmation: scaffold a new `.mdx` using the template in Step 4b.
3. New file path: `sylph-main/app/(posts)/<section>/posts/<slugified-title>.mdx`

---

## Step 4 — Edit method per post

### 4a. Updating an existing post

1. Read the full `.mdx` file.
2. Locate or create a `## Progress log` section.
   - If `## Progress log` **does not exist**: append it at the very end of the file (after all existing content), followed immediately by the new date block.
   - If `## Progress log` **exists**: insert the new `### <today>` block directly after the `## Progress log` heading line (reverse-chronological — newest entry first).
3. Never insert a duplicate `### <today>` block. If one already exists for today, append bullets to it instead.
4. Block format:

```markdown
## Progress log

### YYYY-MM-DD
- <Bullet 1: what shipped or was learned, first-person, ≤ 25 words>
- <Bullet 2 — if substantively different from bullet 1>
- <Bullet 3 — optional, only if a third distinct point exists>
```

**Voice rules:**
- First-person, past tense, reflective. ("Built", "Discovered", "Decided", "Shipped", "Realised".)
- No emoji. No marketing language ("exciting", "powerful", "seamless").
- Match the tone of contextguard.mdx — direct, technical, opinionated where warranted.
- Each bullet ≤ 25 words. No run-ons.
- Do not fabricate specifics not present in the gathered data.

**Do NOT** edit `time.updated` in frontmatter. `scripts/update-mdx-timestamps.cjs` rewrites it from FS `mtime` at the next `pnpm build`. The file edit itself bumps `mtime`.

**Do NOT** alter any other frontmatter field or existing body prose.

### 4b. New post scaffold

Only used when Step 3c confirms a new post. Use this exact frontmatter shape (all fields from `sylph-main/types/post/index.tsx`):

```mdx
---
title: "<Title>"
tags: ["<tag1>", "<tag2>"]
summary: "<One sentence: what it is and why it exists.>"
author:
  name: "John Ray Loh"
  link: "https://github.com/lohjo"
  handle: "lohjo"
time:
  created: "<ISO 8601 now>"
  updated: "<ISO 8601 now>"
seo:
  description: "<One sentence for search engines, ≤ 155 chars.>"
---

## The thesis

<Why this project/research/piece exists. What premise it is testing.>

## What it does

<Concrete description of the thing. No hype.>

## Progress log

### <today>
- <Bullet 1>
- <Bullet 2>
```

Required fields: `title`, `tags`, `summary`, `author`, `time.created`, `time.updated`, `seo.description`.  
Optional fields (`media`, `related`, `social`, `audience`, `categorization`) — add only if you have real values.

---

## Step 5 — Secret scan

Before staging any file, scan each proposed bullet for:
- Patterns: `API_KEY`, `SECRET`, `password=`, `token=`, `Bearer `, `sk-`, `AKIA` (AWS key prefix), any 40-char hex string.
- If found: strip the offending text, replace with `[REDACTED]`, and warn the user in the summary.

---

## Step 6 — Commit and push

```bash
# Stage only the changed MDX files, explicitly by path
git add sylph-main/app/(posts)/<section>/posts/<slug>.mdx [... repeat for each]

# Commit
git commit -m "$(cat <<'EOF'
daily: <section(s)> update — <YYYY-MM-DD>

- <slug>: <one-line summary of today's progress>
- <slug2>: <one-line summary>  (omit if only one post)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# Push
git push -u origin master
```

**If `git push` is rejected (non-fast-forward):**
1. `git pull --rebase origin master`
2. If rebase succeeds: `git push -u origin master`
3. If rebase conflict: abort (`git rebase --abort`), leave staged changes, report:  
   "Push rejected and rebase conflicted. Staged changes preserved — resolve manually then push."

**If pre-commit hook fails:**  
Fix the root cause, re-stage the same files, and create a **new** commit (never `--amend`, never `--no-verify`).

---

## Step 7 — Abort / skip conditions

These are checked at the point in the workflow indicated, not all at pre-flight.

| When | Condition | Action |
|---|---|---|
| **Pre-flight (Step 1)** | Working tree dirty (non-MDX changes) | Abort. Ask user to stash or commit first. |
| **After synthesis (Step 3)** | No commits today AND no chat activity AND no user notes | Print `Nothing to update.` and exit cleanly. No commit. |
| **After synthesis (Step 3)** | > 5 posts matched | Stop and confirm list with user before continuing. |
| **Before staging (Step 5)** | Secret-like string detected in bullet | Strip + `[REDACTED]` + warn. Continue with redacted bullet. |
| **During push (Step 6)** | Merge conflict on rebase | Abort rebase, preserve staged changes, report. |

---

## Step 8 — End-of-run summary

Print to user:

```
/daily complete — <YYYY-MM-DD>

Posts updated:
  - <section>/<slug> (<N> bullets added)
  - ...

Commit: <SHA>
Push: origin/master ✓

Suggested spot-check:
  pnpm dev  →  http://localhost:3000/<section>/<slug>
```

If nothing was updated, print only: `Nothing to update — no activity detected for <YYYY-MM-DD>.`

Do **not** auto-start the dev server. Suggest, do not run.
