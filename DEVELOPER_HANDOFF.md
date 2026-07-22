# Scribe Portal Workflow and Integration Handoff

This document defines the intended production workflow behind the current Vue prototype. The cards and counts in the prototype are local mock data; developers must connect them to schedule, SAGE encounter, assignment, agent-processing, provider-review, and audit services.

## Operational ownership

- **Medical Practice Admin:** creates and maintains the schedules of the practice's providers.
- **Otangeles Clerk:** creates and maintains scribe coverage schedules.
- **Provider:** receives the generated daily visit list in SAGE, performs the visit, completes the encounter, and ends it in SAGE.
- **Assigned Scribe:** supervises the encounter after the ended SAGE encounter is routed to them. The scribe validates the AI-completed final note, intervenes only on surfaced exceptions, and sends it to the provider.
- **Otangeles Agents:** build one shared clinical understanding, reconcile medications, identify diagnoses and plans, generate the 18 note sections and codes, and run quality and compliance checks before human oversight.

## End-to-end lifecycle

1. A Practice Admin schedules providers for a medical practice.
2. An Otangeles Clerk schedules scribe coverage for the same operating date and coverage scope.
3. The daily visit list is generated for the medical practice.
4. Each scheduled provider receives their visits in SAGE.
5. The provider conducts a visit and ends the encounter in SAGE.
6. SAGE publishes the ended encounter to the Scribe system. The payload must include the final Visit Note or voice transcript and the identifiers needed for assignment.
7. The assignment service resolves the applicable scribe coverage and creates an immutable encounter assignment record.
8. The encounter appears in the assigned scribe's **In Pipeline** workflow view while Records, Draft, and QA agents work.
9. When QA completes, the encounter leaves In Pipeline and enters that scribe's **Final Review** queue.
10. Opening an encounter goes directly to **Final Note Review**, where the scribe sees the generated note, section confidence, linked evidence, and the QA Agent's review checks.
11. If no blocking checks remain, the scribe validates the key clinical decisions and sends the note without opening the Encounter Editor. If a check requires judgment, its action opens only the relevant editor section; saving the correction returns the scribe to Final Note Review and reruns the affected checks.
12. The scribe sends the AI-completed, human-supervised note to the provider.
13. The encounter leaves Final Review and appears in that scribe's **With Provider** workflow view.
14. The provider can sign the note or request a section-specific revision.
15. A revision request leaves the active With Provider list and re-enters the assigned scribe's Final Review queue as a red Provider Revision card. Only the requested section is surfaced as a blocking review check.
16. After the scribe corrects the requested section and its checks pass, the encounter returns to With Provider.
17. Signed encounters remain visible briefly for confirmation, then move to encounter history according to the retention rule chosen by Product (recommended: 24–48 hours).

## Meaning of the three workflow views

The scribe switches among these views with a minimal Final Review / In-Pipeline / With Provider tab row beside shared encounter search and filters. The tabs change workflow state without adding a second page headline.

### In Pipeline

Contains only ended SAGE encounters that are already assigned to the logged-in scribe and are currently being prepared by agents.

- Do not place upcoming visits or the daily visit list here.
- Entry condition: SAGE encounter ended, payload received, and scribe assignment resolved.
- Visible status names the specialist currently responsible, such as Intake/Evidence, Medication Reconciliation, Clinical Reasoning, Documentation, Coding, QA, or Compliance.
- Exit condition: agent QA completed; move to Final Review with any unresolved exceptions attached.
- Failure conditions such as source-sync failure, agent failure, or missing assignment require an explicit exception state and must not silently disappear.

### Final Review

Contains AI-completed encounters assigned to the logged-in scribe that are ready for human oversight.

- Standard items completed agent QA and open directly in Final Note Review.
- Provider Revision items are returned notes and must be red and prioritized.
- Review checks, confidence, and evidence determine whether human intervention is needed.
- The Encounter Editor is exception-only and opens to the affected section.
- An encounter stays here until blocking checks are clear and the scribe sends it to the provider.

### With Provider

Contains notes sent by the logged-in scribe to providers.

- Suggested visible states: Delivered, Viewed, Awaiting Signature, Signed.
- A provider revision request transitions the encounter back to Final Review.
- Signed items can remain temporarily, then move to history.

Each scribe sees only encounters currently assigned to them. Clerks and authorized operational administrators need a separate team-wide view with search, reassignment, exception handling, and an assignment audit trail.

## Scribe assignment contract

The SAGE event must include at least:

- `encounterId`
- `patientId`
- `medicalPracticeId`
- `facilityId`
- `providerId`
- `scheduledVisitId`, when available
- `visitDate`
- `encounterEndedAt`
- `visitNote`
- `transcript`, when available
- source-document references and versions

The clerk's scribe coverage record must include:

- `scribeId`
- `medicalPracticeId`
- coverage date
- shift or start/end timestamps
- optional `providerId` for provider-specific coverage
- optional `facilityId` when coverage differs by facility
- active/cancelled status

Recommended assignment precedence:

1. Provider-specific coverage matching practice, provider, facility when applicable, and encounter end time.
2. Practice/facility shift coverage matching the encounter end time.
3. An explicit distribution rule if Product allows multiple equivalent scribes on the same coverage window.
4. Otherwise, create an Unassigned exception for clerk resolution.

Do not infer ownership from the calendar date alone when multiple scribes cover the same practice. Do not silently move an encounter because a schedule is later edited. Persist the original assignment and require an explicit reassignment action with actor, timestamp, old owner, new owner, and reason.

## Required encounter states

Backend state names can differ, but the system must represent these transitions unambiguously:

```text
sage_ended
  -> assignment_pending
  -> agent_records
  -> agent_draft
  -> agent_qa
  -> ready_for_final_review
  -> exception_edit (only when required)
  -> ready_to_send
  -> sent_to_provider
  -> provider_delivered
  -> provider_viewed
  -> signed

sent_to_provider | provider_delivered | provider_viewed
  -> revision_requested
  -> ready_for_final_review
```

Also support terminal or recoverable exception states for assignment failure, duplicate SAGE events, missing Visit Note, source-sync failure, agent failure, and cancelled encounters.

## Transition and audit requirements

Every state change must record:

- encounter ID
- previous and next state
- assigned scribe ID
- actor type and actor ID
- timestamp
- reason or event source
- relevant payload/version identifiers

SAGE ingestion and downstream transition handlers must be idempotent. Replayed `encounter ended` events must not create duplicate assignments or duplicate queue cards.

Use real-time updates or short polling so Pipeline progress, queue arrival, provider viewing, revision requests, and signatures appear without requiring a full page refresh.

## Notifications

Notify the assigned scribe when:

- an encounter is assigned and enters In Pipeline;
- agent QA fails or processing is delayed;
- the encounter becomes ready in Final Review;
- a provider requests a revision;
- a provider signs the note.

Notify the clerk when:

- no matching scribe coverage exists;
- coverage is ambiguous;
- processing is blocked and requires reassignment or operational intervention.

## Encounter Editor data and interaction contract

The Vue prototype demonstrates the intended interaction, but the production editor must be driven by the same clinical schema as the original Encounter Editor in `Otangeles-main`. Do not reduce RoS or PE to free text, one boolean per row, or one generic dropdown. The control type, polarity, children, laterality, notes, and conditional visibility are part of the clinical data contract.

### Review of Systems (RoS)

- Persist a source of `direct`, `indirect`, `unable`, or `null`.
- Direct, indirect, and unable are mutually exclusive. Clearing the source also clears the source-specific fields and all RoS findings.
- Indirect requires one or more source selections: nursing staff/caregivers, family/legal guardians, prior records, or other external sources.
- Unable requires one reason: unresponsive, dementia, AMS, or other. Free-text reason detail is shown only for Other.
- Every symptom has a tri-state value: `unset`, `negative` (Denies), or `positive` (Reports). It is not a checkbox.
- The row exposes only **Denies** and **Reports**. Clicking the already-selected action returns that symptom to `unset`.
- Every symptom can have its own note. Each body-system category also has a separate additional-comments field.
- Category-level **Denies All** changes only that category. Global **Denies All** changes all 15 categories. Turning either switch off returns the affected symptoms to `unset`.
- Setting a symptom through Denies All clears that symptom's note. Selecting Unable clears every symptom and symptom note.
- The API must preserve stable category and symptom IDs; display labels are not identifiers.

### Physical Exam (PE)

Every PE finding must carry schema metadata equivalent to:

```text
id
name
polarity: normal_when_present | abnormal_when_present
inputType: toggle | select | multi-toggle | chips
toggleStyle
options[] with normality
details with showWhen
laterality with showWhen and options
children[]
showChildrenWhen
showChildrenForSelections[]
```

Required behavior:

- A toggle is always a two-choice control and clicking the active choice returns it to `unset`.
- Toggle labels depend on the finding: Present/Absent, Yes/No, Normal/Abnormal, Awake/Not Awake, Alert/Not Alert, Intact/Not Intact, Equal/Not equal, Regular/Irregular, or Normal/Amputated.
- Color comes from clinical normality, not the button position: normal is green and abnormal is red. Use `polarity` to determine which selected side is normal.
- Select findings use only their configured options. Each option declares whether it is normal or abnormal.
- Multi-toggle and chip findings allow multiple configured values. Do not convert them to a single dropdown.
- Child findings appear only when their parent's configured condition is satisfied. Hidden children must be reset so stale clinical values are not submitted.
- Laterality is a toggle group, normally Left / Bilateral / Right. Clicking the selected side clears it. It appears only under the configured condition.
- Detail inputs appear only under their configured condition. Mood and Affect, for example, shows its detail input only when Other is selected.
- **Reset Findings** clears the current PE category, including child values, details, laterality, and category comments. **Set all normal** applies the normal value determined by each finding's polarity and option metadata.
- Persist parent and child findings separately by stable ID. A selected child finding must not be flattened into an unstructured parent note.

The agent-filled values and manual edits must use the same schema and payload. Opening an exception changes only the selected section into its clinical editor; saving replaces that section draft, preserves its evidence and audit relationships, records the correction as learning feedback, reruns affected checks, and returns the scribe to Final Note Review. There is no per-section “Mark as reviewed” step.

## Implementation acceptance criteria

- An ended SAGE encounter is assigned to exactly one scribe or one explicit Unassigned exception.
- The assigned scribe sees the same encounter in only one active workflow location at a time.
- In Pipeline contains no unended or merely scheduled visits.
- QA completion moves an encounter from In Pipeline to Final Review with unresolved checks preserved.
- Queue actions open Final Note Review directly; the Encounter Editor is entered only from a section-specific edit or exception action.
- Final Review has no skip action; every assigned encounter remains in sequence until the scribe checks it.
- Final Review presents one dedicated Up Next card and at most nine remaining cards; when Up Next is sent, the next unsent encounter is promoted automatically.
- In-Pipeline and With Provider cards retain the Final Review information hierarchy—patient and encounter ID, practice and facility, status summary, visit, and timing—without review actions.
- Every final-note section exposes a numeric confidence score and expandable source evidence.
- Blocking review checks appear on Final Note Review and prevent provider send until resolved.
- Sending from Final Note Review moves it from Final Review to With Provider.
- A provider revision preserves accepted sections and returns only the requested section to Final Review.
- Signed notes leave the active workflow according to the configured history-retention rule.
- Reassignments and all state transitions are auditable.
- Duplicate SAGE events do not duplicate encounters.
- Counts on all three workflow views are scoped to the logged-in scribe unless the user is in an authorized team-wide view.
- Render at most 10 encounter cards in each workflow view; retain the full workflow count and summarize remaining items below the visible set.
- Medical Practice and Facility filters must remain searchable with partial matching as option lists grow.
- Patient names and encounter IDs must remain on separate lines so long names never displace or wrap the identifier; secondary card text must remain comfortably readable rather than relying on sub-10px typography.
- Each workflow card exposes practice, facility, visit type, and responsibility through an accessible details accordion with `aria-expanded` state.
- Final Note Review metadata, decision summaries, evidence, generated-note content, and sidebar checks must retain the readable typography baseline demonstrated by the prototype.
- RoS source changes, tri-state symptom values, Denies All behavior, symptom notes, and category notes round-trip without data loss.
- PE control types, polarity colors, conditional children, details, laterality, and reset behavior are schema-driven and round-trip without flattening.
- Manual editing one section does not overwrite agent output, evidence links, review state, or audit history for any other section.
