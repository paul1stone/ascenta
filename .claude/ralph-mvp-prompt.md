# Ralph Loop: Ascenta MVP Feature Implementation

Work through the per-feature requirements files in `docs/reqs/`, one logical section per iteration.

**SKIP `docs/reqs/mvp.md`** — it is an overarching index, not a per-feature spec.

## File processing order

Move to the next file only when the current file has zero unchecked `- [ ]` boxes:

1. `docs/reqs/strategy-studio.md`
2. `docs/reqs/perf-reviews.md`
3. `docs/reqs/goals.md`
4. `docs/reqs/check-ins.md`
5. `docs/reqs/reflect.md`
6. `docs/reqs/culture-gym.md`

## Per-iteration steps

**Step 1 — Isolated worktree.** Invoke `superpowers:using-git-worktrees` to create a worktree. Branch name: `feat/<file-stem>-<section-slug>`.

**Step 2 — Pick next section.** Pick the next unchecked H2 or H3 section in the current reqs file. A "section" = the heading plus its direct child unchecked items. One section per iteration. Do not tackle whole files at once.

**IMPORTANT: Before picking a section, read `.claude/ralph-mvp-state.md`.** Any section listed there as "in-flight / open PR" or "deferred" MUST be skipped — subsequent iterations move to the next uncovered section. After each iteration, APPEND the section you just worked to the state file.

**Step 3 — Verify existing state FIRST.** Read the relevant source in `apps/platform` and `packages/`. Any checkbox whose behavior is already implemented — check it off `- [x]` and commit with message `docs: verify <section> already implemented`. If this empties the section, push the branch, open no PR, run ExitWorktree, iteration is done.

**Step 4 — Implement remaining work.** Follow the superpowers flow:
- If design is ambiguous, invoke `superpowers:brainstorming`
- Always invoke `superpowers:writing-plans` before code
- Use `superpowers:test-driven-development` during implementation
- Keep scope to this section only. Do NOT implement adjacent sections.

**Step 5 — Verify.** Run `pnpm lint && pnpm test && pnpm build`. All must pass.

**Step 6 — Open PR.** Use the `gh-pr-main` skill. Do NOT merge. Do NOT delete branches.

**Step 7 — Check off boxes.** On the branch, mark the completed `- [ ]` items as `- [x]` in the reqs file and include in the PR.

**Step 8 — Cleanup.** Invoke `ExitWorktree`. Report file, section, PR URL, and checkbox delta.

## Stop condition

When every unchecked `- [ ]` box across all 6 feature reqs files is resolved, output `<promise>MVP_FEATURES_COMPLETE</promise>`.

## Constraints

- Never force-push
- Never merge to main
- Never delete branches
- Use `pnpm` — this is a Turborepo monorepo
- Follow conventions in `/Users/jason/personal-repos/ascenta/CLAUDE.md`
- If blocked or ambiguous on a product decision, stop and surface the question rather than guessing
