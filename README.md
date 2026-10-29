# MegaDev

## MEGA.dev S01E03 — what it shows

`kb/` is the support desk's kb export with one page added:
`kb/src/routes/kb/incidents/4471/split/+page.svx` (logic in `kb/src/lib/kb/problems.ts` and
`ProblemTable.svelte`). `rendered/4471-split.html` is that page as the desk sees it.

Support ticket #4471 holds three problems, filed here as issues #1 (parser, 374 reports),
#2 (booking-v3 hint, 33) and #3 (one-day move, 5).

Build: `cd kb && npm install && npm run build`.
