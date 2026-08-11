# Tooling

- Prefers BrowserAct (browser-act-cli via uv) for browser automation tasks: browsing, clicking, filling forms, handling login flows, solving CAPTCHAs, bypassing bot detection, and extracting structured data from websites. Explicitly directs the assistant to use it when present (e.g., "use the browseract" to fetch Instagram images). Confidence: 0.9

- Uses Command Code's skills system and is open to installing established third-party skill sets (e.g., obra/superpowers) globally into `~/.commandcode/skills` so they're available across all projects, not just one. Confidence: 0.6

- Runs zsh as their shell (nvm loaded via `.zshrc`); when diagnosing shell/PATH issues, expects the assistant to account for zsh configs and behavior. Confidence: 0.9

- Expects dependency installation problems to be diagnosed from the actual lockfile/node_modules state and repaired explicitly, then verified with the real project checks rather than assumed fixed from an npm success message. Confidence: 0.8

- Directs the assistant to use specific Command Code skills for the work at hand (e.g., "use the skill design" for UI work) and expects the skill's process — activating it, reading its references, and following its rules — to be followed rather than ad-hoc implementation. Confidence: 0.7

- Uses browser-act CLI for live browser verification: loads the skill workflow, opens a browser session, screenshots the actual page, and evaluates JS in the DOM to measure rendered geometry (getBoundingClientRect) rather than trusting guesswork. Confidence: 0.6

- When configuring project environment variables, prefers them written directly to the repository-root `.env` file rather than only being shown as instructions or placed in `.env.local`. Confidence: 0.8

- Expects hand-written SQL migrations to be idempotent/re-runnable against the live database: after a migration re-run failed on non-idempotent `CREATE POLICY` statements, the fix was adding `DROP POLICY IF EXISTS` guards before each policy (and `CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` elsewhere) so re-applying the file is safe — this was accepted without complaint. Confidence: 0.5

- Approves removing dead/unused dependencies to keep the dependency tree lean — when the assistant flagged `date-fns` as installed-but-never-imported and offered to remove it, replied tersely "yeah remove it", expecting the removal to be completed (manifest + lockfile) and verified, not just described. Confidence: 0.6
