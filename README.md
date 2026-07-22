# Otangeles Note+ Scribe Portal

An isolated Vue 3 application for the scribe workflow. Its application shell mirrors the connected admin portal’s header, grouped left navigation, spacing, colors, collapse behavior, and responsive mobile drawer without importing runtime code or state from that project.

## Run locally

```bash
npm install
npm run dev
```

Build the production bundle with:

```bash
npm run build
```

## Developer handoff

The production scheduling, SAGE ingestion, scribe assignment, agent pipeline, queue, provider handoff, revision, audit, notification, and exception requirements are documented in [`DEVELOPER_HANDOFF.md`](./DEVELOPER_HANDOFF.md).

## Application areas

- Final Review queue: a dedicated single-card Up Next container automatically promotes the next unsent encounter, followed by at most nine remaining cards
- Workflow switcher: Final Review, In-Pipeline, and With Provider use one minimal tab row beside shared search and filters; Medical Practice and Facility filters support type-ahead and partial matching
- In Pipeline: status-only tracking with the same patient, practice/facility, visit, summary, and timing structure as Final Review
- With Provider: delivery, viewing, and signature status using the same card information hierarchy as Final Review
- Live agent processing: a Pipeline encounter animates through Records, Draft, QA, and Final Review readiness
- Exception-only Encounter Editor: review checks open the affected section directly for agent revision or manual correction
- SAGE Visit Note handoff: Notes identifies the provider's typed Visit Note or final voice transcript captured when the SAGE encounter ends, then explains how Records, Note, and QA agents use it to build the draft
- Provider revisions: red, section-scoped return cards open with previously accepted sections checked and only the provider-requested section highlighted for focused editing
- Final Note Review: decision-first clinical review with a readable 11–16px information hierarchy, expandable supporting evidence, blocking review checks, specialized-agent trace, and provider handoff; the full 18-section note stays collapsed until requested
- Learning feedback: section-scoped corrections persist structured before/after values, rationale, actor, timestamp, and model version for a future learning pipeline
- Readable card hierarchy: patient names and encounter IDs use separate lines, with larger supporting text for practices, facilities, summaries, visits, and timing
- Encounter-detail accordions: every workflow card can expand practice, facility, visit type, and current responsibility without crowding the default row
- Dashboard, Patients, Calendar, My Performance, and Settings are represented as navigation-only destinations for the current prototype scope.

All displayed content is local mock data in `src/data/portalData.js` and `src/data/editorData.js`. Each workflow tab renders at most 10 cards. `src/data/clinicalIntelligence.js` is the prototype's single shared clinical-understanding and autonomy-policy layer; it drives sections, decisions, outputs, evidence, exceptions, and agent responsibilities. `src/stores/encounterDraft.js` carries section edits into the final preview and persists correction feedback plus Final Review → With Provider transitions in browser storage. Production services must replace the mock reasoning and local persistence. No admin-portal APIs, authentication state, or runtime dependencies are shared.
