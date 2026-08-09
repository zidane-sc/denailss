# Taste
- Prefers real, live data from the original/official source over static mocks or placeholders — even when it means extra setup work (e.g., asked to fetch real Instagram images and embed the latest post rather than keeping seeded placeholder images). Confidence: 0.8
- Prefers lightweight, officially-sanctioned integration paths (e.g., pasting Instagram's "Copy embed code" into a component) over unofficial scraping or building heavy backend/Graph API infrastructure — favors no-backend, low-friction solutions that still deliver real content. Confidence: 0.7
- Doesn't accept "that's not possible" at face value — will research and paste official documentation to push a feature forward, and expects the assistant to verify feasibility before declaring something impossible. Confidence: 0.6
- Comfortable with a manual content-maintenance workflow for third-party embeds: will copy official embed codes (e.g., Instagram "Copy embed code") and paste the raw HTML into chat for the assistant to wire into the codebase, accepting paste-to-update maintenance (swapping shortcodes/data values) over building automated fetch-and-cache infrastructure. Confidence: 0.8
- Delegates subjective selection decisions to the assistant (e.g., "you choose it!" for which Instagram image to use) instead of prescribing exact content, trusting the assistant's judgment on details. Confidence: 0.5
- Communicates in Indonesian with terse, direct feedback (e.g., "kurang 1 data" — "missing 1 data"; "tidak perlu ada tag juga" — "no tags either"), checking the delivered result against the expected dataset and pasting the exact raw embed/data needed to fill any gap. Confidence: 0.8

- Prefers conventional, well-structured commit messages (feat:/fix: scopes, detailed body with bullet points and co-author attribution). Confidence: 0.5

- Wants domain-accurate data modeling of real-world nuance — e.g., nail art is not a flat/static service but has difficulty levels (easy/medium/complex) that should drive per-design pricing, so data models should carry that variability (e.g., a `difficulty` field) instead of single hard-coded prices. Confidence: 0.6

- Prefers the displayed price to stay stable in the customer flow — selecting a design should not visibly change the price shown (the estimate/nominal stands and the final price is confirmed separately, e.g., via WhatsApp) rather than the summary updating per design click. Re-stated explicitly ("sepertinya tidak perlu berubah harga setelah klik desain"). Confidence: 0.7

- Expects thorough verification before finalizing a task — typechecking, git status/diff review, and a full picture of what's being committed — even when the user didn't explicitly ask for it. Confidence: 0.6

- Challenges proposed flows when the decision-maker doesn't match reality — e.g., the customer must never self-assess nail-art difficulty/pricing in the booking flow; difficulty is set by the artist/studio on curated designs and quoted by the artist for custom requests. Prefers flows where authority lives with the party who owns it in the real world. Confidence: 0.9

- Keeps every product surface consistent with the booking domain model — when the customer booking flow gains capabilities (multiple services per booking, press-on fulfillment choice), the backoffice and customer portal must render the same model. The user proactively audits for stale views and asks to sync them ("backoffice masih blm sync dengan changes yang sudah kita lakukan... please sync kan", citing backoffice showing only one service and lacking the fulfillment option). Confidence: 0.8

- Wants the promo/discount step to be visible for every service in the booking flow, not conditional on service type — explicitly insisted "step promo visible untuk semua layanan!". Confidence: 0.7

- Expects made-to-order/delivered items (e.g., press-on fake nails) to get a fulfillment/pickup step in the booking flow (ambil di lokasi vs dikirim via kurir), replacing the date/time slot that applies to in-studio services — and it should appear whenever fake-nail is selected, even alongside other in-studio services, not only when it is the sole service. Confidence: 0.8

- Wants multi-step booking/wizard flows to derive their steps dynamically from the current selection and skip steps that don't apply rather than showing empty or irrelevant ones — e.g., the Desain step only when nail-art, fake-nail, or gel-extension is selected, and skipped entirely for manicure/pedicure/removal-only bookings. Confidence: 0.8

- Press-on/fake-nail is a medium that can carry any nail-art design, so the design catalog must associate all designs with fake-nail — the "Pilih Desain" step must never render empty for a service that legitimately triggers it (flagged the empty design list for fake-nail as a defect to investigate/fix, not a data limitation). Confidence: 0.7

- Prefers the design-selection step to show the full catalog without service-based filtering — explicitly suggested dropping the `relatedServiceSlugs` filter ("sepertinya untuk pilih desain tidak perlu filter relatedServiceSlugs") since any design can be applied to any eligible service (including press-on); only search/style/color/occasion filters should apply. Confidence: 0.8

- Requires UI work to avoid generic "AI slop" aesthetics — explicitly demanded "donot make ai slop design" — meaning deliberate, design-system-consistent surfaces (dense scan-friendly layouts over default card grids, real images over placeholders, restrained accent use, full empty/loading/error state coverage) rather than default template output. Confidence: 0.6

- Prefers a lean feature set: features the user deems unnecessary get deleted outright rather than kept ("apa fungsi reset katalog" → "tidak perlu" → "hapus feature-nya"; "tidak perlu tanggal terbit" → the entire publish-date feature removed). Confidence: 0.7
- Expects feature/data-field removal to be complete across every surface: the type definition, mock data, admin form (state + input + submit payload), admin list (column, sort options, statistics cards), and public-view usage (e.g., landing sort) — with no dead-code or stale references left behind, verified by grep + typecheck. Confidence: 0.85

- Wants catalog/design photos to be strictly owner-upload-only — the admin form must not offer the pre-seeded stock image set as selectable options; images are added via upload and must be removable. Explicitly specified the flow: "katalog yang boleh dipilih hanya berasal dari upload gambar ... tidak bisa dari seed items, bisa hapus gambar". Confidence: 0.75

- Expects admin-managed content to be wired end-to-end into public customer surfaces, not kept backoffice-only: uploaded designs must show up live in the public gallery catalog and in the booking/order design step ("tampilkan pada katalog dan order items"), via a shared live-catalog seam rather than static seed data. Also expects admin-set fields like the custom `price` to be rendered to customers on the public gallery card and detail page ("tampilkan di card galery dan detaik"), not just stored. Confidence: 0.8

- Wants admin control over the display order of user-facing content, not just what content exists — e.g., explicitly requested a feature to reorder uploaded design photos ("tambah feature untuk mengubah urutan gambar yang tampil"), with the ordering stored and respected by the public consumers. Later refined the reorder UX to drag-and-drop on a compact thumbnail grid rather than per-item move buttons. Confidence: 0.7

- Prefers compact, dense layouts in management UIs over spacious one-item-per-row lists — explicitly rejected a one-image-per-row layout ("jangan 1 gambar 1 row, buat compact seperti sebelumnya") in favor of a responsive thumbnail grid; for reordering prefers drag-and-drop (over move arrow buttons) and expects clicking a thumbnail to open a large preview/detail. Confidence: 0.8

- Wants admin pricing to be a custom free-text input rather than locked to an auto-derived value (e.g., design price always computed from difficulty tier) — the owner should be able to type any price, including overrides such as promos. Explicitly stated: "harga sebaiknya masuman custom saja freetext", then confirmed by fully removing the tier-derived price mechanism (`priceFrom`) and its sort/display surfaces in favor of the custom `price` field. Confidence: 0.8

- Wants the user-facing UI to never render invalid/broken values from stale data — flagged "RpNaN" on gallery cards as a defect; expects old persisted data (e.g., localStorage entries saved before a field like `price` existed) to be migrated automatically on load with sensible fallbacks, and formatting helpers to be defensive (non-finite/negative amounts render "—" instead of "NaN"), rather than telling the user to reset their data. Confidence: 0.5

- Wants data tables in admin/backoffice UIs to expose a configurable "items per page" pagination selector (options like 5/10/15/25/50) defaulting to 10, instead of a hard-coded page size — explicitly requested "berapa banyak item per page pagination" with "default 10". Confidence: 0.7

- Prefers WhatsApp as the customer-communication channel woven into backoffice/admin UX: after consequential actions — approving a deposit, rejecting a manual deposit verification (with the rejection reason embedded in the pre-filled message), or rescheduling an appointment — offer a follow-up "Beri Tahu Customer"/"Beri Tahu di WhatsApp" option (modal or in-drawer panel) with a pre-filled notification message (plus a "Nanti saja" escape), and provide a WhatsApp chat button on admin surfaces (detail pages, and in the calendar drawer's customer profile card) — instead of leaving the operator to contact the customer manually. Explicitly asked for the notify step after BOTH outcomes of manual deposit verification ("setuju atau ngga"). Confidence: 0.9

- Wants new panels/sections inside a drawer or sheet to sit within the content container's padding and spacing system, not appended at the sheet edge — flagged the WhatsApp notify panel's spacing against the drawer as "suck"; the fix is to place it inside the same `px-* py-* space-y-*` wrapper as sibling sections so it inherits consistent horizontal padding and vertical rhythm instead of sticking to the edges. Confidence: 0.6
