---
name: ticket-to-pr
description: Use when given a Jira ticket key or URL (e.g. "ACE-123") or asked to take a ticket, issue, story or bug through to a pull request in this repo, combining the planning, implementation, verification and review skills in one pass.
---

# Ticket to PR

Orchestrates other skills for one ticket in the acenz2 monorepo. It adds no new engineering rules: each phase names the skill to invoke and the repo-specific facts that skill cannot know. Run phases in order and announce each one ("Phase 3: …").

## Gates (stop and ask the user)

- Acceptance criteria are missing, vague or contradict the code → ask before designing.
- The change would touch something outside the ticket's scope (token rename, shared DTO shape, migration on existing data) → ask.
- Before `git push`, opening the PR, commenting on or transitioning the Jira ticket → confirm, unless the user's request already said to do it.

## Phases

**1. Intake.** Read the ticket with Atlassian MCP: `getAccessibleAtlassianResources` once for `cloudId`, then `getJiraIssue`. Also read linked issues and comments. Write down the acceptance criteria as a numbered list; this list is the definition of done for Phases 6 and 8.

**2. Classify surfaces.** From the ticket, decide which rows apply. This selects the domain skills for Phase 5.

| Ticket touches | Invoke in Phase 5 |
|---|---|
| Bug, failing test, unexpected behavior | `superpowers:systematic-debugging` first |
| `apps/api` routes, middleware, env | `express-typescript` |
| `apps/api/src/db` entities, migrations | `typeorm` |
| Request/response shape | DTO in `packages/shared` first (Zod), then api + web |
| `packages/ui`, `apps/web` styling | `tailwind-design-system`, `react-vite-best-practices`, `docs/design-system.md` |
| `turbo.json`, new package, workspace or CI config | `turborepo` |

**3. Design.** Invoke `superpowers:brainstorming` for any new behavior or ambiguity. A precise bug fix with a known cause can skip to Phase 4.

**4. Isolate and plan.** Invoke `superpowers:using-git-worktrees` (or `git switch -c`) with branch `<type>/<KEY>-<short-slug>`, where type is `feat`, `fix`, `chore` or `refactor`. For work with more than one step, invoke `superpowers:writing-plans`.

**5. Implement.** Invoke `superpowers:test-driven-development`, plus the skills selected in Phase 2. Repo rules that apply here:

- Order for a cross-cutting change: `shared` DTO → `api` → `web`. Entities stay in `apps/api`, never in `shared` or `web`.
- Schema change means a migration (`synchronize` is off). Run `pnpm --filter @acenz/api migration:generate src/db/migrations/<Name>` and read the generated SQL before keeping it.
- UI: tokens only, no hard-coded colors, `cx()` for class merging, shared logic in `@acenz/core`. Follow `docs/design-system.md` section 4 when migrating a component.
- Commit in small steps with conventional commits and a scope, ticket key in the body: `feat(ui): add EmptyState illustration (ACE-123)`.

**6. Verify.** Invoke `superpowers:verification-before-completion`. Run from the repo root and read the output:

```bash
pnpm build && pnpm lint && pnpm typecheck && pnpm test
```

Then walk the Phase 1 acceptance criteria one by one and state the evidence for each. For UI changes, also check light and dark themes at 375px and 1280px (use the `run` skill and a browser), and go through the checklist in `docs/design-system.md` section 8.

**7. Review.** Invoke `superpowers:requesting-code-review` (or `/code-review`) on the branch diff. Handle findings with `superpowers:receiving-code-review`. Re-run Phase 6 after any fix.

**8. Pull request.** Invoke `superpowers:finishing-a-development-branch`. The PR title is the conventional-commit line with the ticket key. The body has exactly these parts, in this order:

1. `Jira: <KEY>` with a link.
2. Summary: what changed and why, 2 to 4 lines.
3. Acceptance criteria: the Phase 1 list as a checklist, each item ticked with its evidence.
4. Verification: the commands run and their result.
5. UI changes only: before/after screenshots. Token changes only: each token with old → new value.

**9. Close the loop.** After the PR exists, comment its link on the Jira ticket (`addOrEditJiraIssueComment`). Transition the ticket (`transitionJiraIssue`) only if the user asked for it.

## Quick reference

| Situation | Do |
|---|---|
| No acceptance criteria | Ask; do not invent them |
| Ticket is one-line typo or copy fix | Skip Phases 3 and 4; keep 6 and 8 |
| Verification fails | `superpowers:systematic-debugging`, never a claim of success |
| Ticket spans api and web | One branch, one PR, commits ordered shared → api → web |
| Ticket is too large for one PR | Stop after Phase 4 and propose a split to the user |
