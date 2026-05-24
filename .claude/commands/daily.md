# /daily — End-of-day portfolio update

Read `instruction.md` at the repo root. Execute the full workflow defined there for **today's date** (resolve at runtime — do not use any hardcoded date).

## Execution order

1. **Read** `/home/user/my-website/instruction.md` before taking any other action.
2. **Pre-flight** (Step 1): check working tree is clean.
3. **Gather data** (Step 2): run sub-steps 2a, 2b, and 2c **in parallel** via simultaneous tool calls. After they resolve, run 2d (user notes prompt) interactively.
4. **Synthesise** (Step 3): map gathered activity to existing posts. Respect the > 5 post guard and new-post confirmation gate.
5. **Edit** (Step 4): apply prose updates to matched posts only.
6. **Secret scan** (Step 5): scan every proposed bullet before staging.
7. **Commit + push** (Step 6): stage explicit file paths, commit, push to `origin/master`.
8. **Summarise** (Step 8): print the end-of-run report. (Skip / abort conditions in Step 7 apply throughout — not just here.)

## Stop-and-ask moments (only these three)

- After gathering data: "Anything else from today worth adding? (Press Enter to skip.)"
- When > 5 posts are matched: confirm the list before editing.
- When a commit has no post match: confirm section + title before scaffolding a new post.

All other decisions are made autonomously per the rules in `instruction.md`.
