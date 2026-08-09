# Workflow

- Wants explicit consent before consequential browser actions: pause and ask rather than acting (e.g., only click a GitHub star "if I explicitly say yes"; pause and ask before any task that needs login or confirmation). Confidence: 0.9

- Wants tooling set up to be verified end-to-end after install/update ("install or update ... then verify it works") — not just installed and reported as done. Confidence: 0.6

- Prefers the assistant to read the official skill/setup documentation first before executing a task ("Read the BrowserAct skill first"). Confidence: 0.5

- Wants the assistant to commit completed work to git as part of wrapping up a task ("commit current changes") rather than leaving the repo with uncommitted changes; expects the assistant to handle staging and committing, including pre-existing uncommitted work from others. Confidence: 0.7

- Wants project documentation kept in sync with code changes — "update @docs if needed" (e.g., AGENTS.md, docs/PROGRESS.md) should be checked and updated as part of finishing a task. Confidence: 0.9

- Commits authored by the assistant are expected to follow conventional-commit format with a scoped `feat:`/`fix:` summary, a detailed bullet-point body, and the `Co-authored-by: CommandCodeBot` attribution line — the user hasn't objected to this format in reviews. Confidence: 0.5

- Wants competitive/market research grounded in authoritative sources (official studio price lists, reputable articles like Kompas, market-data sites) before deciding whether the current service/feature set is complete and what to add — e.g., "check our services, is it enough? can you do research what service should we add?" Confidence: 0.7

- Prefers a propose-then-approve workflow for significant features: the assistant researches, presents a concrete plan/recommendation, and waits for explicit go-ahead (e.g., a terse "yeah go!") before implementing — rather than jumping straight to code. Confidence: 0.6
