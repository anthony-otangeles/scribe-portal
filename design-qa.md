# Design QA — AI-first Encounter Oversight

- Production Scribe Portal shell source: `/tmp/scribe-source-shell.png`
- Original editor source: `/home/tony-desktop/Downloads/Otangeles-main/resources/src/app/pages/VisitDetail.vue`
- Original section editors: `/home/tony-desktop/Downloads/Otangeles-main/resources/src/ui/components/sections/`
- Original document preview source: `/home/tony-desktop/Downloads/Otangeles-main/resources/src/app/pages/EncounterPreview.vue`
- Shared shell comparison input: `/tmp/unified-shell-comparison-final.png`
- Agent-processing shell comparison input: `/tmp/agent-work-shell-comparison.png`
- Active-agent sample on queue, desktop: `/tmp/agent-work-queue-desktop.png`
- Corrected queue placement, desktop: `/tmp/agent-work-queue-placement-desktop.png`
- Agent actively drafting, desktop: `/tmp/agent-work-processing-active-desktop.png`
- Agent draft ready, desktop: `/tmp/agent-work-processing-ready-desktop.png`
- Active-agent sample on queue, mobile: `/tmp/agent-work-queue-mobile.png`
- Corrected queue placement, mobile: `/tmp/agent-work-queue-placement-mobile.png`
- Agent actively drafting, mobile: `/tmp/agent-work-processing-active-mobile.png`
- Agent draft ready, mobile: `/tmp/agent-work-processing-ready-mobile.png`
- Unified encounter, desktop: `/tmp/unified-encounter-desktop-final.png`
- Medications manual editor, desktop: `/tmp/unified-manual-desktop-final.png`
- Document preview, desktop: `/tmp/document-preview-desktop-final.png`
- Unified encounter, mobile: `/tmp/unified-encounter-mobile-final.png`
- Medications manual editor, mobile: `/tmp/unified-manual-mobile-final.png`
- Document preview, mobile: `/tmp/document-preview-mobile-final.png`
- Clean queue, desktop: `/tmp/scribe-clean-queue-desktop.png`
- Admin-aligned profile menu with full email: `/tmp/scribe-clean-profile-desktop-final.png`
- Simplified live processing, desktop: `/tmp/scribe-clean-processing-desktop.png`
- Focused encounter review, desktop: `/tmp/scribe-clean-review-desktop.png`
- Section-specific manual editing, desktop: `/tmp/scribe-clean-manual-desktop.png`
- Readable provider preview, desktop: `/tmp/scribe-clean-preview-desktop.png`
- Clean queue, mobile: `/tmp/scribe-clean-queue-mobile.png`
- Encounter review with persistent final action, mobile: `/tmp/scribe-clean-review-mobile-final.png`
- Live processing, mobile: `/tmp/scribe-clean-processing-mobile.png`
- Provider preview, mobile: `/tmp/scribe-clean-preview-mobile.png`
- Corrected review-only queue, desktop: `/tmp/scribe-corrected-queue-desktop.png`
- Expanded Pipeline list, desktop: `/tmp/scribe-corrected-pipeline-desktop.png`
- Expanded With Provider list, desktop: `/tmp/scribe-corrected-provider-desktop.png`
- Admin-matched profile menu, desktop: `/tmp/scribe-final-profile-desktop.png`
- Corrected shell and queue, mobile: `/tmp/scribe-final-queue-mobile.png`
- Admin-matched full-width profile menu, mobile: `/tmp/scribe-final-profile-mobile.png`
- Expanded Pipeline list, mobile: `/tmp/scribe-final-pipeline-mobile.png`
- Refined Encounter Editor actions, mobile: `/tmp/scribe-final-editor-mobile-actions.png`
- Pre-redesign queue audit: `/tmp/scribe-audit-01-current-queue.png`
- Pre-redesign Pipeline audit: `/tmp/scribe-audit-02-current-pipeline.png`
- Pre-redesign Encounter Editor audit: `/tmp/scribe-audit-03-current-editor.png`
- Card-based Scribe Queue, desktop: `/tmp/scribe-card-08-queue-desktop-final.png`
- Card-based In Pipeline, desktop: `/tmp/scribe-card-02-pipeline-desktop.png`
- Card-based With Provider, desktop: `/tmp/scribe-card-03-provider-desktop.png`
- Card-based Scribe Queue, mobile: `/tmp/scribe-card-07-queue-mobile-final.png`
- Card-based In Pipeline, mobile: `/tmp/scribe-card-05-pipeline-mobile.png`
- Provider revision queue card, desktop: `/tmp/scribe-revision-09-red-queue-desktop.png`
- Provider revision editor, desktop: `/tmp/scribe-revision-10-red-editor-desktop.png`
- Completed provider revision with updated section, desktop: `/tmp/scribe-revision-11-complete-updated-desktop.png`
- Provider revision editor, mobile: `/tmp/scribe-revision-12-red-editor-mobile.png`
- Compact Final Review queue, desktop: `/tmp/scribe-queue-desktop.png`
- Compact With Provider rows, desktop: `/tmp/scribe-provider-fixed.png`
- Decision-first Final Note Review, desktop: `/tmp/scribe-final-desktop.png`
- Compact Final Review queue, mobile: `/tmp/scribe-queue-mobile.png`
- Compact With Provider rows, mobile: `/tmp/scribe-provider-mobile.png`
- Decision-first Final Note Review, mobile: `/tmp/scribe-final-mobile-fixed.png`
- Desktop viewports: 1920 × 993 for shell comparison and 1440 × 1000 for document preview.
- Mobile viewport: 390 × 844.

## Outcome

No actionable P0, P1, or P2 issues remain in the requested frontend scope. Encounter Oversight now defaults to AI-completed Final Review, uses one minimal three-tab workflow row, renders In-Pipeline and With Provider as status-only rows, and sends queue actions directly to a decision-first Final Note Review. The full note is an optional output of one shared clinical understanding instead of the primary review task.

## Findings

- A legacy `.is-provider` rule initially stretched With Provider rows to 300px. It was removed; In-Pipeline and With Provider now use the same four-part information hierarchy as Final Review and reflow cleanly to one column on mobile.
- Queue cards are now compact horizontal summaries. Patient identity, status/exception, visit, timing, and the final-review action remain; low-value progress, repeated metadata blocks, and card-height inflation are gone.
- At 390 × 844, Queue, With Provider, Encounter Editor, and Final Note Review report no horizontal page overflow. A grid min-content issue found in Final Review was fixed with a zero-minimum responsive column.
- Final Review shows three key clinical decisions, evidence and output traceability, six specialized agent responsibilities, review checks, and structured learning feedback before offering the full 18-section note.

## Open Questions

- None for the requested frontend sample. Production timing and messages can be connected to real agent events when the backend stream is available.

## Fidelity Review

- Layout and navigation: The global Otangeles header and left navigation remain intact. Final Review, In-Pipeline, and With Provider use a compact underline tab treatment with no repeated workflow headline.
- Density: Queue cards use a compact four-column desktop grid and a clear mobile stack. Status-only workflow rows have no buttons or expandable content.
- Decision hierarchy: Final Review leads with shared reasoning, key diagnoses/treatment/coding decisions, generated outputs, confidence, and evidence. The generated note stays collapsed by default.
- Exception workflow: Open checks are shown in the Final Review rail, block provider send, and deep-link only to the affected editor section. The editor has no per-section “Mark as reviewed” action.
- Responsive behavior: Queue, status views, editor, and final review fit 390px without horizontal page overflow; medication tables retain intentional internal scrolling.
- Accessibility: Workflow selection uses a labeled native select; evidence controls expose `aria-expanded`; buttons retain semantic disabled states and mobile primary actions stay reachable.

## Functional Evidence

- The Queue has one three-option minimal tab row, one page headline, and no more than 10 final-review cards. `Up Next` remains Marisol Vega (`ENCT-240716-0842`), and no Skip action is rendered.
- In-Pipeline and With Provider render at most 10 status-only cards with zero row actions; each includes patient/ID, practice/facility, status summary, visit, and timing.
- All desktop cards use identical column tracks, so a newly delivered “Just now” row aligns exactly with timestamped rows. Medical Practice and Facility filters provide searchable suggestions and case-insensitive partial matching.
- Final Review renders one Up Next card plus nine remaining cards. Removing the current encounter promotes the next ID automatically; patient names and encounter IDs are stacked, with 16px names and 13px status summaries.
- Each card has a closed-by-default Encounter details accordion for practice, facility, visit type, and responsibility. Final Note Review now uses 11px minimum metadata labels, 13px decision summaries, and 16px decision titles.
- Queue actions route directly to `/encounters/:id/preview`; the Encounter Editor is reachable from a blocking check or explicit “Edit a section” action.
- QA-flagged Final Review renders three decision cards, five review checks with two open, six specialized agents, and a disabled provider-send action.
- A Ready encounter renders `AI-completed`, zero open checks, and an enabled provider-send action.
- The generated clinical note is hidden by default. Opening it renders all 18 sections, 18 numeric confidence scores, and 18 evidence accordions.
- Resolving the Medications dose conflict through “Use eMAR” stored encounter, section, actor, timestamp, model version, reason, before, and after values; Final Review then displayed one captured feedback item and reduced open checks from two to one.
- The Encounter Editor contains no “Mark as reviewed” or “Review Current”; its workflow step is Edit / Current and the persistent action returns to Final Note Review.
- The production build succeeds with the decision-first workflow and shared clinical-intelligence layer.

## Visual Comparison History

- Pass 1: The earlier architecture duplicated the editor and review routes, used overly compact controls, and hid the provider CTA below mobile content.
- Fix: Consolidated the editor states, restored the original section rail, enlarged clinical UI and controls, introduced the document preview route, and made the mobile provider CTA persistent.
- Pass 2: Compared the normalized production shell and final unified encounter in the same 1920 × 993 input. Logo placement, header/sidebar proportions, active Encounter treatment, neutral canvas, and portal spacing are consistent. The header search is intentionally retained from the interconnected admin-portal design requested for the new isolated app.
- Pass 3: Re-captured desktop and 390 × 844 mobile states for agent-filled content, manual Medications editing, and document preview. No overlap, clipping, horizontal overflow, or blocked primary action remains.
- Pass 4: Added and captured the missing active-agent state on both the queue and processing route. The initial process capture shows Records complete, Draft active at 28%, QA waiting, and Review waiting; the ready capture shows all agent steps checked and an unobstructed editor handoff. A same-viewport shell comparison confirms the new state retains the established logo, header, sidebar, active Encounter treatment, typography, and portal proportions.
- Pass 5 (superseded): Temporarily placed the active Helen Montgomery sample inside `Your Queue` after removing the standalone live card.
- Pass 6: Refined the existing interface without changing its established structure. Simplified queue guidance, consolidated live-agent status and progress, added section review context, reduced QA/sidebar noise, removed the duplicate manual-editor heading, increased document legibility, and aligned the profile dropdown with the admin portal while showing the full email. Desktop and 390 × 844 captures show no clipping or horizontal overflow, including the persistent mobile `Review Note` and `Send to Provider` actions.
- Pass 7: Matched the admin portal header order and avatar/profile behavior, including the right-side mobile hamburger and full-width mobile profile menu. Removed active processing work from `Your Queue`, replaced the ambiguous pills with explanatory Pipeline and With Provider workflow cards and lists, and added clearer agent/QA/source context plus persistent section actions to the Encounter Editor. End-to-end checks confirm Pipeline → processing → Encounter Editor → Final Note Review → provider handoff with no runtime exceptions or horizontal overflow.
- Pass 8: Rebuilt the mixed hero/accordion/table queue into a consistent encounter-card system. Added Medical Practice to all review-ready, processing, and provider cards; separated the three workflow states into clear tabs; added practice and facility filters; and compacted the mobile workflow selector so the next encounter appears above the fold. Rechecked Queue → Editor → manual section edit → Review Note → Send to Provider and Pipeline → live progress → ready → Editor with no runtime exceptions or horizontal overflow.
- Pass 9: Reworked Joseph Reed’s generic Returned encounter into the SAGE-style section-scoped Provider revision flow. The red queue card identifies Medications as the sole requested section and shows that 17 sections were already accepted. The editor opens directly on Medications with 17 green checks, one red revision target, the provider’s exact instruction, disabled Review Note until completion, and a green reconciled medication result after saving. Final Note Review identifies the completed provider revision and returns it to Dr. L. Shah. Desktop and 390 × 844 checks have no runtime exceptions or horizontal overflow.
- Pass 10: Separated the Encounter Editor breadcrumb and Records/Draft/QA/Review chips into a dedicated navigation strip matching Final Note Review. Normalized active breadcrumbs to dark text with a purple hover state, aligned every review-ready queue CTA with the mint Editor and Note Review primary actions, restored the exact original 18-section Lucide icon mapping, and rebuilt Notes as the provider's SAGE Visit Note/voice-transcript source record. Desktop and 390 × 844 checks confirm all 18 Lucide icons, zero horizontal overflow, and a working Notes manual-edit → Review Note → Send to Provider path.

## Scope Notes

- Backend persistence, authentication, live agent updates, and actual provider delivery are intentionally mocked.
- Dashboard, Patients, Calendar, My Performance, and Settings remain navigation-only as requested.

## Implementation Checklist

- [x] Final Review is the default workflow and queue actions bypass the Encounter Editor.
- [x] In-Pipeline and With Provider are status-only workflow views selected from the minimal tab row.
- [x] No queue encounter can be skipped; every assigned encounter remains available for required scribe review.
- [x] Queue cards show only identity, status/exception, visit, timing, and action.
- [x] Every workflow view renders no more than 10 cards while preserving total counts and remaining-item summaries.
- [x] Practice and facility filters support searchable suggestions, partial text matches, and individual clear controls.
- [x] Up Next contains exactly one card and automatically promotes the first unsent encounter; card typography remains readable on desktop and mobile.
- [x] Card accordions and the larger Final Note Review typography introduce no horizontal overflow at 390px.
- [x] Final Review prioritizes clinical decisions and keeps generated documentation collapsed by default.
- [x] Diagnoses, recommendations, codes, and generated outputs link to supporting evidence.
- [x] Every generated note section has numeric confidence and expandable sources.
- [x] Review checks are present on Final Review and block send only when unresolved.
- [x] The editor is exception-only, has no per-section reviewed action, and labels the current stage Edit.
- [x] Specialized agents have distinct responsibilities and outputs.
- [x] Human corrections are captured as structured learning feedback.
- [x] One clinical-understanding model supplies decisions, documentation, codes, orders, summaries, and review checks.
- [x] Autonomy thresholds distinguish AI-completed encounters from human-judgment exceptions.
- [x] Queue, status views, editor, and Final Review have no horizontal page overflow at 390px.
- [x] Production build passes.

## Review and Sign semantic presentation parity — 2026-07-21

- Source truth: the section preview components under `/home/tony-desktop/Downloads/Otangeles-main/resources/src/app/pages/visitDetail/preview` and the reference `--ot-error` token (`#C34A7D`).
- All 18 Final Note Review sections render in the same clinical section order and retain their confidence and evidence controls.
- ROS displays the reference question/source structure. Denied findings remain neutral; every reported symptom and its note use the clinical alert color.
- Physical Exam keeps normal findings neutral while abnormal findings, abnormal notes, and Devices / Treatments use the clinical alert color.
- Vital values marked high, low, abnormal, or out of range use the alert color and display `(Out of Range)`.
- Allergies render the red `Reported` label and highlight severe, anaphylactic, or high-criticality entries.
- Screening emphasis follows the reference thresholds: Morse score ≥40, TUG ≥12 seconds, and PHQ-9 ≥5. TUG also derives the reference mobility result from its recorded seconds.
- Focused desktop captures: `/tmp/final-review-ros-parity.png` and `/tmp/final-review-pe-parity.png` at 1440 × 1000.
- Automated desktop and 390 × 844 checks report zero horizontal page overflow; desktop computed-style checks confirm `rgb(195, 74, 125)` for ROS reports, PE abnormalities, out-of-range vitals, allergy labels, and clinically significant screenings.
- The production build succeeds after the parity pass.

## Section clarification relay parity — 2026-07-21

- Source visual truth: `/tmp/sage-request-revision-reference.png` captured from the local SAGE Request Revision sheet.
- Implementation evidence: `/tmp/scribe-clarification-sheet-mobile.png`, `/tmp/scribe-section-clarification-entry-desktop.png`, `/tmp/scribe-clarification-with-provider-mobile.png`, and `/tmp/scribe-clarification-with-provider-desktop.png`.
- Combined same-viewport comparison: `/tmp/sage-scribe-clarification-comparison.png` at 390 × 844, with the SAGE reference on the left and Scribe implementation on the right.
- State: History of Present Illness is pre-scoped before the sheet opens; the request is unsent and the primary action is disabled until a question is entered.
- Full-view comparison: the implementation preserves SAGE’s dimmed background, bottom-sheet placement, grab handle, large section-scoped title, quiet explanatory panel, tall text field, and full-width purple primary action.
- Focused comparison: a separate crop was unnecessary because the sheet occupies most of the 390 × 844 viewport and its typography, fields, controls, radii, and copy are legible in the combined image.
- Intentional adaptation: Scribe replaces SAGE’s Type / Voice revision modes with a visible Operations delivery route. This avoids implying direct provider messaging or a working voice relay and explains how external providers are contacted.
- Typography: title, body, field label, textarea, and primary-action hierarchy remain consistent with SAGE while using the existing Scribe type system.
- Spacing and layout: the sheet stays within 10px mobile gutters, the 148px question field and primary action remain fully visible, and both mobile and desktop states report zero horizontal overflow.
- Colors and tokens: the implementation uses Scribe’s existing purple token and neutral surfaces while retaining SAGE’s quiet purple request affordance.
- Image and icon fidelity: no raster imagery is required; existing product icon components supply the message, route, information, close, and send icons without placeholder assets.
- Copy and content: the provider, medical practice, selected section, Operations relay, lock state, and answer-return behavior are explicit. External providers do not need a Scribe Portal account.
- Primary interactions tested: all 18 section actions, open/close sheet, required question, submit, persistent request record, immediate removal from Final Review, placement at the top of With Provider, expanded routing details, Operations-recorded answer, and return to Final Review as `Clarification received`.
- Responsive evidence: 390 × 844 and 1440 × 1000 checks pass; With Provider remains capped at 10 visible cards.
- Browser console: zero warnings or runtime exceptions during the final entry, sheet, and With Provider lifecycle check.
- Comparison history: the first combined visual pass found no actionable P0, P1, or P2 fidelity issues. The extra routing content increases sheet height intentionally to resolve the external-provider constraint.
- Production build: passed.

final result: passed
