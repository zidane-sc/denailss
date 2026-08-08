# Taste
- Prefers real, live data from the original/official source over static mocks or placeholders — even when it means extra setup work (e.g., asked to fetch real Instagram images and embed the latest post rather than keeping seeded placeholder images). Confidence: 0.8
- Prefers lightweight, officially-sanctioned integration paths (e.g., pasting Instagram's "Copy embed code" into a component) over unofficial scraping or building heavy backend/Graph API infrastructure — favors no-backend, low-friction solutions that still deliver real content. Confidence: 0.7
- Doesn't accept "that's not possible" at face value — will research and paste official documentation to push a feature forward, and expects the assistant to verify feasibility before declaring something impossible. Confidence: 0.6
- Comfortable with a manual content-maintenance workflow for third-party embeds: will copy official embed codes (e.g., Instagram "Copy embed code") and paste the raw HTML into chat for the assistant to wire into the codebase, accepting paste-to-update maintenance (swapping shortcodes/data values) over building automated fetch-and-cache infrastructure. Confidence: 0.8
- Delegates subjective selection decisions to the assistant (e.g., "you choose it!" for which Instagram image to use) instead of prescribing exact content, trusting the assistant's judgment on details. Confidence: 0.5
- Communicates in Indonesian with terse, direct feedback (e.g., "kurang 1 data" — "missing 1 data"), checking the delivered result against the expected dataset and pasting the exact raw embed/data needed to fill any gap. Confidence: 0.6

- Prefers conventional, well-structured commit messages (feat:/fix: scopes, detailed body with bullet points and co-author attribution). Confidence: 0.5

- Wants domain-accurate data modeling of real-world nuance — e.g., nail art is not a flat/static service but has difficulty levels (easy/medium/complex) that should drive per-design pricing, so data models should carry that variability (e.g., a `difficulty` field) instead of single hard-coded prices. Confidence: 0.6

- Expects thorough verification before finalizing a task — typechecking, git status/diff review, and a full picture of what's being committed — even when the user didn't explicitly ask for it. Confidence: 0.6

- Challenges proposed flows when the decision-maker doesn't match reality — e.g., the customer must never self-assess nail-art difficulty/pricing in the booking flow; difficulty is set by the artist/studio on curated designs and quoted by the artist for custom requests. Prefers flows where authority lives with the party who owns it in the real world. Confidence: 0.9
