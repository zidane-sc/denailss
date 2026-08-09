# Workflow

- Wants explicit consent before consequential browser actions: pause and ask rather than acting (e.g., only click a GitHub star "if I explicitly say yes"; pause and ask before any task that needs login or confirmation). Confidence: 0.9

- Wants tooling set up to be verified end-to-end after install/update ("install or update ... then verify it works") — not just installed and reported as done. Confidence: 0.6

- Prefers the assistant to read the official skill/setup documentation first before executing a task ("Read the BrowserAct skill first"). Confidence: 0.5

- Wants the assistant to commit completed work to git as part of wrapping up a task ("commit current changes") rather than leaving the repo with uncommitted changes; expects the assistant to handle staging and committing, including pre-existing uncommitted work from others. Confidence: 0.7

- Wants project documentation kept in sync with code changes — "update @docs if needed" (e.g., AGENTS.md, docs/PROGRESS.md) should be checked and updated as part of finishing a task; proactively asks whether docs need updating for the latest changes ("do we need update @docs about our changes?") and also asks the assistant to audit that the docs match the actual implementation, not just that they were updated (e.g., "apa sudah sesuai antara docs dan implementasi?"). Confidence: 0.97

- Commits authored by the assistant are expected to follow conventional-commit format with a scoped `feat:`/`fix:` summary, a detailed bullet-point body, and the `Co-authored-by: CommandCodeBot` attribution line — the user hasn't objected to this format in reviews. Confidence: 0.5

- Wants competitive/market research grounded in authoritative sources (official studio price lists, reputable articles like Kompas, market-data sites) before deciding whether the current service/feature set is complete and what to add — e.g., "check our services, is it enough? can you do research what service should we add?" Confidence: 0.7

- Prefers a propose-then-approve workflow for significant features (and notable doc/implementation additions): the assistant researches, presents a concrete plan/recommendation, and waits for explicit go-ahead before implementing — rather than jumping straight to code. Gives terse single-word approvals to greenlight execution (e.g., "yeah", "go", "iya" — approving the image-upload feature proposal). Confidence: 0.9

- Overrides the assistant's reasoned recommendation with terse, decisive instructions when they already know what they want — e.g., after the assistant recommended keeping "related services" because public pages use it, the user simply said "hapus 2-2nya, hapus juga yang existing" (delete both, including existing data) and expected the full removal executed without further debate. Confidence: 0.7

- Expects commits to stay scoped to the current task: when unrelated pre-existing changes are already in the working tree (e.g., from a previous session), stage and commit only the files relevant to this task rather than folding everything into one commit. Confidence: 0.6

- Wants the assistant to apply fixes directly once a problem is diagnosed, rather than stopping at explanation — explicitly directs action with terse commands (e.g., "fix it") and expects the fix to be implemented and verified, not just described. Confidence: 0.6

- Delegates next-step/roadmap planning to the assistant: asks "whats next" while pointing at the project's progress doc, expecting the assistant to read the doc, check existing plans and recent commits, and propose the next concrete epic/task (with a suggested approach) rather than asking the user what to do. Repeatedly confirmed — asked "what's next" again with no extra context and expected the assistant to pull next steps from `docs/PROGRESS.md` on its own. Confidence: 0.75

- Prefers building features front-end only on the existing mock data seam, deferring backend wiring to a later epic (explicitly said "do FE only") — mock-first implementation behind a named seam is the accepted interim until a real repository layer exists. Confidence: 0.55

- Agrees to keep user-uploaded/runtime-generated artifacts out of version control (approved adding `public/images/uploads/` to `.gitignore`) — generated storage, unlike source assets, should be gitignored so it doesn't get committed/deployed. Confidence: 0.5

- Frames UI-change requests as global/comprehensive: expects the change applied to every instance of the pattern in scope (e.g., "modif seluruh ui table in @src/app/backoffice" — all tables in the folder; "ketika approve atau reschedule ... dan juga di appointment detail" — the WhatsApp notify option on both approve and reschedule flows across the detail view and calendar; "di halaman overview ... tampilkan modal 'Beri tahu customer'" — the same deposit-verification notify flow requested on the overview page too; "di halaman drawer kalendar, tambahkan juga button whatsapp serta button menuju halaman detail appointment" — the same WhatsApp + detail-link buttons on the calendar drawer), not just a single occurrence; the assistant is expected to locate all instances and update each consistently, and the user keeps requesting the same flow on each new surface as it comes up. Confidence: 0.9

- Explicitly requires the requirement documents (PRD and TRD), not just the progress log, to be kept in sync when an implemented change alters an existing requirement — stated directly: "update the @docs about our progress also TRD and PRD if we have change the existing requirement!!!". Expects the assistant to audit which docs are affected by the change and update them (e.g., TRD skipped only when it genuinely doesn't define the changed detail), and to note requirement changes explicitly (what was removed/changed and why). Confidence: 0.85
