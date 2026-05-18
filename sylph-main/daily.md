# /daily — End-of-day portfolio update

Read `instruction.md` at the repo root. Execute the workflow defined there for today's date (resolve "today" at runtime using the current date from context, not any cached value).

## Execution order

1. **Pre-flight** (§1): check working tree is clean. Abort if dirty.

2. **Gather** (§2a–2c): run all three auto-gather steps in parallel tool calls:
   - Git activity since midnight
   - Claude JSONL chat files modified today
   - Memory files modified today

3. **User notes** (§2d): after auto-gather completes, prompt once for free-form additions.

4. **Synthesise** (§3): map gathered activity to existing posts. Pause for user input only if:
   - A commit matches no post and looks like a new project (§3c)
   - More than 5 posts are matched (§3d)

5. **Edit** (§4): write `## Progress log` entries to matched posts. Create new post files only after explicit user confirmation.

6. **Commit + push** (§5): stage named files only, commit with the prescribed message format, push to `origin/master`.

7. **Report** (§7): print the verification summary.

## Rules in effect

All hard rules from `instruction.md` §0 apply throughout: no secrets, no force-push, no `--no-verify`, no `git add -A`, abort on conflict. When in doubt, prefer asking the user over acting.