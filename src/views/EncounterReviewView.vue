<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import ClarificationRequestSheet from '../components/ClarificationRequestSheet.vue'
import ManualSectionEditor from '../components/ManualSectionEditor.vue'
import SectionIcon from '../components/SectionIcon.vue'
import { editorSections } from '../data/editorData'
import { allEncounters, reviewSections } from '../data/portalData'
import {
  encounterDraft,
  encounterWorkflowState,
  recordClarificationRequest,
  recordEncounterSectionEdit,
  updateEncounterSection,
} from '../stores/encounterDraft'
import { formatPatientName } from '../utils/patientName'

const route = useRoute()
const router = useRouter()
const selectedId = ref('code')
const resolvedFlags = ref([])
const openEvidence = ref(reviewSections.flatMap((item) => item.facts.map((fact, index) => `${item.id}:${index}`)))
const labAnswer = ref('')
const reviseOpen = ref(false)
const revisionText = ref('')
const revisionSent = ref(false)
const toast = ref('')
const manualEditing = ref(false)
const sourcesOpen = ref(true)
const clarificationOpen = ref(false)

const encounter = computed(() => allEncounters.find((item) => item.id === route.params.id) || allEncounters[1])
const providerRevision = computed(() => encounter.value.revision || null)
const editedSectionIds = computed(() => encounterWorkflowState.editedSections[encounter.value.id] || [])
const selectedIndex = computed(() => reviewSections.findIndex((section) => section.id === selectedId.value))
const section = computed(() => reviewSections[selectedIndex.value] || reviewSections[0])
const isRequestedSection = computed(() => providerRevision.value?.sectionId === section.value.id)
const currentSectionEdited = computed(() => editedSectionIds.value.includes(section.value.id))
const currentClarification = computed(() => encounterWorkflowState.clarificationRequests?.[encounter.value.id] || null)
const clarificationPending = computed(() => currentClarification.value?.status === 'awaiting-provider')
const revisionEdited = computed(() => providerRevision.value ? editedSectionIds.value.includes(providerRevision.value.sectionId) : false)
const labsResolved = computed(() => Boolean(labAnswer.value) || editedSectionIds.value.includes('labs'))
const flaggedFacts = computed(() => reviewSections.flatMap((item) => item.facts
  .map((fact, index) => fact.flag ? { ...fact, sectionId: item.id, sectionLabel: item.label, key: `${item.id}:${index}` } : null)
  .filter(Boolean)))
const relevantFlaggedFacts = computed(() => encounter.value.status === 'QA flags' ? flaggedFacts.value : [])
const hasAgentQuestion = computed(() => encounter.value.status === 'Agent question')
const openFlags = computed(() => relevantFlaggedFacts.value.filter((fact) => !resolvedFlags.value.includes(fact.key) && !editedSectionIds.value.includes(fact.sectionId)))
const openQuestions = computed(() => !hasAgentQuestion.value || labsResolved.value ? 0 : 1)
const attentionCount = computed(() => providerRevision.value
  ? (revisionEdited.value ? 0 : 1)
  : openFlags.value.length + openQuestions.value)
const currentSectionIssues = computed(() => {
  if (currentSectionEdited.value) return 0
  if (providerRevision.value) return isRequestedSection.value && !revisionEdited.value ? 1 : 0
  const flags = relevantFlaggedFacts.value.filter((fact) => fact.sectionId === section.value.id && !isFlagResolved(fact.key)).length
  return flags + (hasAgentQuestion.value && section.value.question && !labsResolved.value ? 1 : 0)
})

watch(selectedId, () => {
  manualEditing.value = false
  reviseOpen.value = false
})

watch(() => [route.params.id, route.query.section], resetReviewState, { immediate: true })

function resetReviewState() {
  const nextEncounter = allEncounters.find((item) => item.id === route.params.id) || allEncounters[1]
  const revision = nextEncounter.revision
  const requestedSection = typeof route.query.section === 'string' && reviewSections.some((item) => item.id === route.query.section)
    ? route.query.section
    : null
  selectedId.value = requestedSection || revision?.sectionId || 'code'
  resolvedFlags.value = revision
    ? reviewSections.flatMap((item) => item.facts.map((fact, index) => fact.flag ? `${item.id}:${index}` : null).filter(Boolean))
    : []
  labAnswer.value = revision ? 'Document as pending' : ''
  openEvidence.value = reviewSections.flatMap((item) => item.facts.map((fact, index) => `${item.id}:${index}`))
  sourcesOpen.value = true
  clarificationOpen.value = false
  manualEditing.value = false
  reviseOpen.value = false
  revisionText.value = ''
  revisionSent.value = false
}

function isEvidenceOpen(key) { return openEvidence.value.includes(key) }
function toggleEvidence(key) {
  openEvidence.value = isEvidenceOpen(key) ? openEvidence.value.filter((item) => item !== key) : [...openEvidence.value, key]
}
function isFlagResolved(key) {
  const flaggedSection = flaggedFacts.value.find((fact) => fact.key === key)?.sectionId
  return resolvedFlags.value.includes(key) || (flaggedSection ? editedSectionIds.value.includes(flaggedSection) : false)
}
function resolveFlag(key, resolution) {
  if (!resolvedFlags.value.includes(key)) resolvedFlags.value = [...resolvedFlags.value, key]
  const resolvedFact = flaggedFacts.value.find((fact) => fact.key === key)
  if (resolvedFact) recordEncounterSectionEdit(encounter.value.id, resolvedFact.sectionId, {
    type: 'clinical-resolution',
    reason: resolvedFact.flag,
    before: resolvedFact.text,
    after: resolution,
  })
  showToast(`Resolved: ${resolution}`)
}
function isFactException(fact) {
  return encounter.value.status === 'QA flags' && Boolean(fact.flag)
}
function jumpTo(id) { selectedId.value = id; manualEditing.value = false }
function goSection(direction) {
  const target = Math.max(0, Math.min(reviewSections.length - 1, selectedIndex.value + direction))
  selectedId.value = reviewSections[target].id
}
function answerLab(answer) {
  labAnswer.value = answer
  recordEncounterSectionEdit(encounter.value.id, 'labs', {
    type: 'minimum-clarification',
    reason: section.value.question,
    before: 'Unresolved',
    after: answer,
  })
  showToast('Answer saved · section re-drafted')
}
function sendRevision() {
  if (!revisionText.value.trim()) return
  revisionSent.value = true
  reviseOpen.value = false
  showToast('Revision sent to the Note Agent')
}
function openManualEditor() {
  manualEditing.value = true
  reviseOpen.value = false
}
function openClarification() {
  if (clarificationPending.value) return
  clarificationOpen.value = true
  reviseOpen.value = false
}
function submitClarification(question) {
  recordClarificationRequest(encounter.value.id, {
    sectionId: section.value.id,
    sectionLabel: section.value.label,
    question,
    provider: encounter.value.provider || 'Dr. A. Patel',
    medicalPractice: encounter.value.medicalPractice,
    facility: encounter.value.facility,
  })
  clarificationOpen.value = false
  showToast(`${section.value.label} clarification routed to Otangeles Operations`)
  window.setTimeout(() => router.push({ path: '/encounters', query: { view: 'provider', highlight: encounter.value.id } }), 900)
}
function saveManualEdit(value) {
  const previousValue = JSON.parse(JSON.stringify(encounterDraft[selectedId.value]))
  let nextValue = value
  if (providerRevision.value && selectedId.value === 'meds') {
    nextValue = JSON.parse(JSON.stringify(value))
    const furosemide = nextValue.items?.find((item) => item.name.toLowerCase().includes('furosemide'))
    if (furosemide?.status === 'Needs review') furosemide.status = 'Active'
    if (nextValue.notes?.includes('differs from the latest provider progress note')) {
      nextValue.notes = 'Furosemide dose verified against the latest eMAR: 20 mg by mouth once daily.'
    }
    nextValue.reconciled = true
  }
  updateEncounterSection(selectedId.value, nextValue)
  recordEncounterSectionEdit(encounter.value.id, selectedId.value, {
    type: 'manual-section-correction',
    reason: providerRevision.value?.text || 'Scribe correction from Final Note Review',
    before: previousValue,
    after: nextValue,
  })
  manualEditing.value = false
  showToast(`${section.value.label} saved · check updated and correction logged for learning`)
}
function reviewNote() {
  router.push(`/encounters/${encounter.value.id}/preview`)
}
function showToast(message) {
  toast.value = message
  window.setTimeout(() => { if (toast.value === message) toast.value = '' }, 2300)
}
function confidenceTone(confidence) {
  if (confidence === 'High') return 'green'
  if (confidence === 'Medium') return 'gold'
  return 'red'
}
function sectionStatus(item) {
  if (providerRevision.value?.sectionId === item.id && !editedSectionIds.value.includes(item.id)) return 'revision'
  if (editedSectionIds.value.includes(item.id)) return 'edited'
  const hasOpenFlag = relevantFlaggedFacts.value.some((fact) => fact.sectionId === item.id && !isFlagResolved(fact.key))
  if (hasOpenFlag) return 'flag'
  if (hasAgentQuestion.value && item.question && !labsResolved.value) return 'question'
  return 'ready'
}
function navMeta(id) {
  return editorSections.find((item) => item.id === id) || { navLabel: id, label: id }
}
</script>

<template>
  <section class="review-page">
    <header class="encounter-header">
      <div class="encounter-navigation-bar">
        <nav class="encounter-crumbs" aria-label="Breadcrumb">
          <button type="button" @click="router.push('/encounters')">Encounters</button>
          <AppIcon name="chevronRight" :size="14" color="#99A1AF" />
          <strong class="encounter-crumbs__current mono">{{ encounter.id }}</strong>
        </nav>
        <div class="pipeline-steps" aria-label="Encounter workflow">
          <span class="complete"><i><AppIcon name="check" :size="12" /></i><b>Records</b><small>08:31</small></span>
          <span class="complete"><i><AppIcon name="check" :size="12" /></i><b>Draft</b><small>08:34</small></span>
          <span class="complete"><i><AppIcon name="check" :size="12" /></i><b>QA</b><small>08:35</small></span>
          <span class="active"><i><AppIcon name="edit" :size="12" /></i><b>Edit</b><small>Current</small></span>
        </div>
      </div>
      <div class="patient-header">
        <div>
          <h1>{{ formatPatientName(encounter.patient, encounter.sex) }}</h1>
          <span class="patient-practice"><AppIcon name="practice" :size="13" /> <strong>{{ encounter.medicalPractice }}</strong></span>
          <span>DoB (Age): <strong>{{ encounter.dobAge || '09/08/1943 (82)' }}</strong></span>
          <span>DoA / Loc: <strong>{{ encounter.admitLocation || '06/12/2024 · 214-B' }}</strong></span>
          <span>Provider: <strong>{{ encounter.provider || 'Dr. A. Patel' }}</strong></span>
        </div>
        <span class="agent-ready" :class="{ 'is-revision': providerRevision }"><AppIcon :name="providerRevision ? 'refresh' : 'bot'" :size="13" /> {{ providerRevision ? 'Provider revision received' : 'Agent-filled draft ready' }}</span>
      </div>
    </header>

    <div class="review-workspace">
      <nav class="section-nav" aria-label="Note sections">
        <header class="section-nav__header">
          <div><strong>Note sections</strong><span>{{ reviewSections.length }} AI-completed sections</span></div>
          <i>Edit</i>
        </header>
        <button v-for="item in reviewSections" :key="item.id" type="button" :title="navMeta(item.id).label" :aria-label="navMeta(item.id).label" :class="{ active: selectedId === item.id, revision: sectionStatus(item) === 'revision' }" @click="jumpTo(item.id)">
          <SectionIcon :name="navMeta(item.id).icon" :size="16" :stroke-width="1.9" />
          <span>{{ navMeta(item.id).navLabel }}</span>
          <i :class="`is-${sectionStatus(item)}`">
            <AppIcon :name="sectionStatus(item) === 'ready' ? 'check' : sectionStatus(item) === 'edited' ? 'edit' : sectionStatus(item) === 'revision' ? 'refresh' : sectionStatus(item) === 'flag' ? 'alert' : 'message'" :size="9" />
          </i>
        </button>
      </nav>

      <main class="note-panel">
        <div class="section-title">
          <div>
            <span class="section-position">Section {{ selectedIndex + 1 }} of {{ reviewSections.length }}</span>
            <div><h2>{{ section.label }}</h2><span class="chip" :class="`chip--${confidenceTone(section.confidence)}`">{{ section.id === 'notes' ? 'Source record · 100%' : `${section.score}% confidence` }}</span></div>
            <p v-if="isRequestedSection">The provider accepted the rest of the note and requested one focused update here. Revise only this section, then return the note for final review.</p>
            <p v-else-if="providerRevision">This section was already accepted by the provider and does not need another review.</p>
            <p v-else-if="section.id === 'notes'">This is the provider's final Visit Note or voice transcript from SAGE Encounter. Agents use it as source evidence to draft and answer every clinical section.</p>
            <p v-else>The AI completed this section from linked clinical evidence. Edit it only when your judgment is needed to resolve an exception.</p>
          </div>
          <span v-if="isRequestedSection && !revisionEdited" class="provider-revision-chip"><AppIcon name="refresh" :size="12" /> Provider revision</span>
          <span v-else-if="currentSectionEdited" class="reviewed-chip"><AppIcon name="edit" :size="12" /> Human corrected</span>
          <span v-else-if="currentSectionIssues" class="attention-chip"><AppIcon name="alert" :size="12" /> {{ currentSectionIssues }} needs attention</span>
          <span v-else class="ready-chip"><AppIcon name="checkCheck" :size="12" /> AI complete</span>
        </div>

        <div class="section-context" :class="{ 'is-provider-revision': isRequestedSection, 'is-source-record': section.id === 'notes' }" aria-label="Current section status">
          <span><AppIcon :name="section.id === 'notes' ? 'activity' : providerRevision ? 'checkCheck' : 'bot'" :size="13" /> {{ section.id === 'notes' ? 'Received from SAGE Encounter' : providerRevision ? 'Previously reviewed by provider' : 'Filled by Note Agent' }}</span>
          <span><AppIcon :name="section.id === 'notes' ? 'clipboard' : isRequestedSection ? 'refresh' : 'shield'" :size="13" /> {{ section.id === 'notes' ? 'Source for agent draft' : isRequestedSection ? 'Focused revision requested' : providerRevision ? 'No changes requested' : 'Checked by QA Agent' }}</span>
          <span><AppIcon :name="section.id === 'notes' ? 'bot' : 'clipboard'" :size="13" /> {{ section.id === 'notes' ? 'Used across 17 drafted sections' : `${section.facts.length} linked source${section.facts.length === 1 ? '' : 's'}` }}</span>
        </div>

        <article v-if="isRequestedSection" class="provider-revision-request" :class="{ complete: revisionEdited }">
          <div class="provider-revision-request__icon"><AppIcon :name="revisionEdited ? 'checkCheck' : 'message'" :size="19" /></div>
          <div>
            <span>{{ revisionEdited ? 'Revision completed' : `Request from ${providerRevision.requestedBy}` }}</span>
            <h3>{{ revisionEdited ? `${providerRevision.sectionLabel} update is complete` : `${providerRevision.sectionLabel} needs one update` }}</h3>
            <p>{{ providerRevision.text }}</p>
            <small>{{ providerRevision.requestedAt }} · {{ providerRevision.acceptedSections }} other sections accepted</small>
          </div>
        </article>

        <ManualSectionEditor
          v-if="manualEditing"
          :key="section.id"
          compact
          :section-id="section.id"
          :model-value="encounterDraft[section.id]"
          @save="saveManualEdit"
          @cancel="manualEditing = false"
        />

        <template v-else>
        <section v-if="providerRevision && isRequestedSection && revisionEdited" class="revision-updated-content">
          <header><span><AppIcon name="checkCheck" :size="16" /></span><div><strong>Updated medication list</strong><small>Reconciled against the latest eMAR</small></div></header>
          <article v-for="medication in encounterDraft.meds.items" :key="medication.name">
            <div><strong>{{ medication.name }}</strong><span>{{ medication.direction }}</span></div>
            <em>{{ medication.status }}</em>
          </article>
          <p v-if="encounterDraft.meds.notes">{{ encounterDraft.meds.notes }}</p>
        </section>

        <template v-else>
          <article v-if="section.id === 'notes'" class="sage-visit-note">
            <header>
              <span class="sage-visit-note__icon"><AppIcon name="activity" :size="18" /></span>
              <div><small>Clinical source record</small><h3>{{ encounterDraft.notes.sourceLabel }}</h3></div>
              <span class="sage-source-pill"><AppIcon name="check" :size="11" /> Imported</span>
            </header>
            <div class="sage-visit-note__meta">
              <span><small>Source</small><strong>{{ encounterDraft.notes.source }}</strong></span>
              <span><small>Captured as</small><strong>{{ encounterDraft.notes.inputMethod }} · {{ encounterDraft.notes.duration }}</strong></span>
              <span><small>Provider</small><strong>{{ encounter.provider || 'Dr. A. Patel' }}</strong></span>
              <span><small>Encounter ended</small><strong>{{ encounterDraft.notes.endedAt }}</strong></span>
            </div>
            <p>{{ encounterDraft.notes.text }}</p>
            <footer>
              <AppIcon name="bot" :size="15" />
              <span><strong>How agents use this note</strong>Records Agent combines it with PCC and eMAR evidence. Note Agent drafts each clinical section, and QA Agent verifies generated statements against the available sources.</span>
            </footer>
          </article>

          <template v-else>
          <article v-if="section.narrative" class="narrative-card">{{ section.narrative }}</article>

          <div class="facts-list">
            <article v-for="(fact, index) in section.facts" :key="fact.text" class="fact-card" :class="{ flagged: isFactException(fact) && !isFlagResolved(`${section.id}:${index}`) }">
              <div class="fact-row">
                <AppIcon :name="isFactException(fact) && !isFlagResolved(`${section.id}:${index}`) ? 'alert' : 'check'" :size="15" :color="isFactException(fact) && !isFlagResolved(`${section.id}:${index}`) ? '#C9302C' : '#29BB89'" />
                <span>{{ fact.text }}</span>
                <button type="button" :aria-expanded="isEvidenceOpen(`${section.id}:${index}`)" @click="toggleEvidence(`${section.id}:${index}`)">
                  <AppIcon name="eye" :size="11" /> {{ fact.source }} <AppIcon :name="isEvidenceOpen(`${section.id}:${index}`) ? 'chevronUp' : 'chevronDown'" :size="10" />
                </button>
              </div>
              <Transition name="reveal">
                <div v-if="isEvidenceOpen(`${section.id}:${index}`)" class="evidence-card">
                  <q>{{ fact.quote }}</q>
                  <span>{{ fact.ref }} · captured by Records Agent</span>
                </div>
              </Transition>
              <div v-if="isFactException(fact)" class="qa-flag" :class="{ resolved: isFlagResolved(`${section.id}:${index}`) }">
                <div><AppIcon :name="isFlagResolved(`${section.id}:${index}`) ? 'check' : 'alert'" :size="14" /><strong>QA · {{ fact.flag }}</strong></div>
                <p v-if="!isFlagResolved(`${section.id}:${index}`)">The evidence sources disagree. Confirm the intended representation before sending this note.</p>
                <p v-else>Resolved during scribe review. The QA Agent will include the selected resolution in its final check.</p>
                <div v-if="!isFlagResolved(`${section.id}:${index}`)" class="flag-actions">
                  <button type="button" @click="resolveFlag(`${section.id}:${index}`, 'Use eMAR as source of truth')">Use eMAR</button>
                  <button type="button" @click="resolveFlag(`${section.id}:${index}`, 'Clarify with provider')">Clarify with provider</button>
                </div>
              </div>
            </article>
          </div>

          <article v-if="hasAgentQuestion && section.question && !currentSectionEdited" class="agent-question">
            <div><AppIcon name="message" :size="15" /><strong>Note Agent needs your input</strong></div>
            <p>{{ section.question }}</p>
            <div v-if="!labAnswer" class="question-actions">
              <button type="button" @click="answerLab('Document as pending')">Document as pending</button>
              <button type="button" @click="answerLab('Omit until confirmed')">Omit until confirmed</button>
            </div>
            <span v-else><AppIcon name="check" :size="12" /> Answered — {{ labAnswer }} · section re-drafted</span>
          </article>
          </template>
        </template>

        <div v-if="!providerRevision || isRequestedSection" class="review-actions">
          <button type="button" class="button button--secondary clarification-action" :disabled="clarificationPending" @click="openClarification"><AppIcon name="message" :size="15" /> {{ clarificationPending ? 'Clarification pending' : 'Request clarification' }}</button>
          <template v-if="providerRevision">
            <button type="button" class="button button--mint" @click="openManualEditor"><AppIcon name="edit" :size="15" /> {{ revisionEdited ? 'Edit again' : 'Edit requested section' }}</button>
            <button type="button" class="button button--secondary" @click="reviseOpen = !reviseOpen; revisionSent = false"><AppIcon name="refresh" :size="15" /> Ask agent to revise</button>
          </template>
          <template v-else>
            <button type="button" class="button button--secondary" @click="reviseOpen = !reviseOpen; revisionSent = false"><AppIcon name="refresh" :size="15" /> Ask agent to revise</button>
            <button type="button" class="button button--mint" @click="openManualEditor"><AppIcon name="edit" :size="15" /> Edit this section</button>
          </template>
        </div>
        <div v-else class="accepted-section-note"><AppIcon name="checkCheck" :size="15" /> Accepted by {{ providerRevision.requestedBy }} · no changes requested</div>

        <div v-if="reviseOpen" class="revision-box">
          <label for="revision">Instruction to the Note Agent — this section will be re-drafted and re-checked by QA.</label>
          <textarea id="revision" v-model="revisionText" placeholder="Describe the change you want the agent to make..." />
          <button type="button" class="button button--primary" :disabled="!revisionText.trim()" @click="sendRevision"><AppIcon name="send" :size="13" /> Send to Note Agent</button>
        </div>
        <div v-if="revisionSent" class="revision-sent"><AppIcon name="refresh" :size="13" /> Revision requested — Note Agent is re-drafting this section</div>
        </template>
      </main>

      <aside class="qa-panel">
        <template v-if="providerRevision">
          <div class="qa-panel__title">
            <div><h3>Provider revision</h3><p>Only one section needs work</p></div>
            <span :class="{ clear: attentionCount === 0 }">{{ attentionCount }}</span>
          </div>
          <button type="button" class="provider-revision-nav" :class="{ complete: attentionCount === 0 }" @click="jumpTo(providerRevision.sectionId)">
            <span><AppIcon :name="attentionCount === 0 ? 'checkCheck' : 'refresh'" :size="15" /></span>
            <div><small>Requested section</small><strong>{{ providerRevision.sectionLabel }}</strong><p>{{ attentionCount === 0 ? 'Revision completed and ready for final review.' : providerRevision.text }}</p></div>
          </button>
          <div class="accepted-summary">
            <span><AppIcon name="checkCheck" :size="16" /></span>
            <div><strong>{{ providerRevision.acceptedSections }} sections accepted</strong><p>The provider did not request changes to the rest of the note.</p></div>
          </div>
        </template>
        <template v-else>
          <div class="qa-panel__title">
            <div><h3>Review checks</h3><p>42 checks run by the QA Agent</p></div>
            <span :class="{ clear: attentionCount === 0 }">{{ attentionCount }}</span>
          </div>
          <div class="qa-items">
            <button v-for="fact in relevantFlaggedFacts" :key="fact.key" type="button" :class="{ resolved: isFlagResolved(fact.key) }" @click="jumpTo(fact.sectionId)">
              <AppIcon :name="isFlagResolved(fact.key) ? 'check' : 'alert'" :size="13" />
              <span><strong>{{ fact.flag }}</strong><small>{{ isFlagResolved(fact.key) ? 'Resolved during review' : 'Evidence sources disagree' }}</small></span>
              <em>{{ fact.sectionLabel }}</em>
            </button>
            <button v-if="hasAgentQuestion" type="button" :class="{ resolved: labsResolved }" @click="jumpTo('labs')">
              <AppIcon :name="labsResolved ? 'check' : 'message'" :size="13" />
              <span><strong>Agent question</strong><small>{{ labAnswer || (labsResolved ? 'Resolved by section edit' : 'No result found in PCC') }}</small></span>
              <em>Labs</em>
            </button>
          </div>
        </template>
        <button type="button" class="sources-toggle" :aria-expanded="sourcesOpen" @click="sourcesOpen = !sourcesOpen">
          <span><AppIcon name="clipboard" :size="14" /><b>Sources pulled</b><small>5 synced · 08:31 AM</small></span>
          <AppIcon :name="sourcesOpen ? 'chevronUp' : 'chevronDown'" :size="14" />
        </button>
        <Transition name="reveal">
          <div v-if="sourcesOpen" class="source-list">
            <span><i class="teal"><AppIcon name="activity" :size="12" /></i><b>SAGE Provider Visit Note</b><em>Voice · 04:18</em></span>
            <span><i class="purple"><AppIcon name="clipboard" :size="12" /></i><b>PCC Clinical Record</b><em>Current</em></span>
            <span><i class="blue"><AppIcon name="activity" :size="12" /></i><b>Encounter Transcript</b><em>12:48</em></span>
            <span><i class="green"><AppIcon name="pill" :size="12" /></i><b>eMAR</b><em>Synced</em></span>
            <span><i class="gold"><AppIcon name="users" :size="12" /></i><b>Nursing Notes</b><em>3 notes</em></span>
          </div>
        </Transition>
      </aside>
    </div>

    <footer class="review-footer">
      <div class="review-progress"><span><strong>Exception editor</strong><br />Changes are section-scoped and logged as feedback.</span></div>
      <span class="blockers ready"><AppIcon name="shield" :size="13" /> Return to Final Note Review to validate checks and send.</span>
      <button type="button" class="footer-nav" :disabled="selectedIndex === 0" @click="goSection(-1)"><AppIcon name="chevronLeft" :size="15" /> Previous</button>
      <button type="button" class="footer-nav" :disabled="selectedIndex === reviewSections.length - 1" @click="goSection(1)">Next <AppIcon name="chevronRight" :size="15" /></button>
      <button type="button" class="button button--mint review-note-button" :disabled="manualEditing" title="Return to Final Note Review" @click="reviewNote"><AppIcon name="eye" :size="15" /> Final Note Review</button>
    </footer>
    <ClarificationRequestSheet
      v-if="clarificationOpen"
      :section-label="section.label"
      :provider="encounter.provider || 'Dr. A. Patel'"
      :medical-practice="encounter.medicalPractice"
      @close="clarificationOpen = false"
      @submit="submitClarification"
    />
    <Transition name="toast"><div v-if="toast" class="review-toast">{{ toast }}</div></Transition>
  </section>
</template>

<style scoped>
.review-page { display: flex; flex: 1; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden; }
.encounter-header { background: #fff; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.encounter-navigation-bar { align-items: center; border-bottom: 1px solid #EEF0F2; display: flex; gap: 18px; justify-content: space-between; min-height: 50px; padding: 9px 24px; }
.encounter-crumbs { align-items: center; color: var(--muted); display: flex; font-size: 12px; gap: 7px; }
.encounter-crumbs > button { background: transparent; border: 0; color: var(--muted); cursor: pointer; padding: 0; text-decoration: none; transition: color 120ms; }
.encounter-crumbs > button:hover { color: #218C69; }
.encounter-crumbs__current { color: var(--ink); font-size: 12px; }
.pipeline-steps { align-items: center; display: flex; gap: 24px; margin-left: auto; position: relative; }
.pipeline-steps::before { background: linear-gradient(90deg, #55C6A6 0 72%, #DAD1EA 72% 100%); content: ''; height: 2px; left: 14px; position: absolute; right: 14px; top: 15px; }
.pipeline-steps span { align-items: center; color: var(--muted); display: grid; gap: 0 7px; grid-template-columns: 30px auto; min-width: 78px; position: relative; z-index: 1; }
.pipeline-steps span > i { align-items: center; background: #fff; border: 2px solid #55C6A6; border-radius: 50%; color: #218C69; display: flex; grid-row: 1 / span 2; height: 30px; justify-content: center; width: 30px; }
.pipeline-steps span > b { color: #218C69; font-size: 10px; line-height: 13px; }
.pipeline-steps span > small { color: var(--subtle); font-size: 8px; line-height: 10px; }
.pipeline-steps span.active > i { background: var(--purple); border-color: var(--purple); color: #fff; box-shadow: 0 0 0 4px var(--purple-soft); }
.pipeline-steps span.active > b { color: var(--purple-dark); }
.patient-header { align-items: center; display: flex; gap: 18px; justify-content: space-between; padding: 13px 24px 14px; }
.patient-header > div { align-items: baseline; display: flex; flex-wrap: wrap; gap: 10px 16px; }
.patient-header h1 { color: var(--purple); font-size: 25px; letter-spacing: -.025em; margin: 0 4px 0 0; }
.patient-header span { color: var(--muted); font-size: 12px; }
.patient-header span strong { color: var(--ink); }
.patient-header .patient-practice { align-items: center; background: var(--purple-soft); border-radius: 999px; color: var(--purple); display: inline-flex; font-weight: 700; gap: 5px; padding: 5px 9px; }
.patient-header .patient-practice strong { color: var(--purple-dark); }
.patient-header .agent-ready { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; flex-shrink: 0; font-size: 12px; font-weight: 700; gap: 6px; padding: 6px 11px; }
.patient-header .agent-ready.is-revision { background: #FDECEC; color: #B92D29; }
.review-workspace { display: grid; flex: 1; grid-template-columns: 184px minmax(520px, 1fr) 310px; min-height: 0; min-width: 0; overflow: hidden; }
.section-nav { background: #fff; border-right: 1px solid var(--border); overflow-y: auto; padding: 11px 9px; }
.section-nav__header { align-items: center; border-bottom: 1px solid #EEF0F2; display: flex; justify-content: space-between; margin: 0 1px 9px; padding: 5px 7px 12px; }
.section-nav__header > div { display: flex; flex-direction: column; gap: 2px; }
.section-nav__header strong { color: var(--ink); font-size: 11px; }
.section-nav__header span { color: var(--subtle); font-size: 8.5px; }
.section-nav__header > i { background: var(--purple-soft); border-radius: 999px; color: var(--purple-dark); font-size: 9px; font-style: normal; font-weight: 800; padding: 4px 6px; }
.section-nav button { align-items: center; background: #fff; border: 0; border-radius: 5px; color: var(--muted); cursor: pointer; display: flex; font-size: 13px; font-weight: 700; gap: 9px; margin-bottom: 3px; min-height: 40px; padding: 8px 10px; text-align: left; width: 100%; }
.section-nav button > span { flex: 1; }
.section-nav button > i { align-items: center; background: #F3F4F6; border-radius: 50%; display: flex; height: 16px; justify-content: center; width: 16px; }
.section-nav button > i.is-ready { background: var(--green-soft); color: #218C69; }
.section-nav button > i.is-edited { background: var(--purple-soft); color: var(--purple); }
.section-nav button > i.is-revision { background: #FDECEC; color: #C9302C; }
.section-nav button > i.is-flag { background: #FDECEC; color: #C9302C; }
.section-nav button > i.is-question { background: #FFF8E6; color: #9A6912; }
.section-nav button.active { background: var(--purple); color: #fff; }
.section-nav button.active.revision { background: #C9302C; }
.section-nav button.active > i { background: rgba(255,255,255,.2); color: #fff; }
.note-panel { overflow-y: auto; padding: 28px 30px 36px; }
.section-title { align-items: flex-start; display: flex; gap: 12px; justify-content: space-between; }
.section-position { color: var(--subtle); display: block; font-size: 9px; font-weight: 800; letter-spacing: .06em; margin-bottom: 5px; text-transform: uppercase; }
.section-title > div > div { align-items: center; display: flex; gap: 9px; }
.section-title h2 { font-size: 23px; letter-spacing: -.025em; margin: 0; }
.section-title p { color: var(--subtle); font-size: 12.5px; line-height: 19px; margin: 6px 0 18px; }
.reviewed-chip { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; font-size: 12px; font-weight: 700; gap: 5px; padding: 6px 10px; }
.provider-revision-chip { align-items: center; background: #FDECEC; border-radius: 999px; color: #B92D29; display: flex; flex-shrink: 0; font-size: 11px; font-weight: 800; gap: 5px; padding: 6px 10px; }
.attention-chip, .ready-chip { align-items: center; border-radius: 999px; display: flex; flex-shrink: 0; font-size: 11px; font-weight: 700; gap: 5px; padding: 6px 10px; }
.attention-chip { background: #FFF8E6; color: #9A6912; }
.ready-chip { background: var(--green-soft); color: #218C69; }
.section-context { align-items: center; background: #fff; border: 1px solid var(--border); border-radius: 8px; display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 0 0 12px; padding: 9px 12px; }
.section-context span { align-items: center; color: var(--muted); display: flex; font-size: 10.5px; font-weight: 700; gap: 5px; }
.section-context span:first-child { color: var(--purple-dark); }
.section-context span:nth-child(2) { color: #218C69; }
.section-context.is-provider-revision { background: #FFF7F7; border-color: #E8B5B2; }
.section-context.is-provider-revision span:first-child { color: #218C69; }
.section-context.is-provider-revision span:nth-child(2) { color: #B92D29; }
.section-context.is-source-record { background: #F3FBFA; border-color: #C8EAE4; }
.section-context.is-source-record span:first-child, .section-context.is-source-record span:nth-child(2) { color: #147D6B; }
.provider-revision-request { align-items: flex-start; background: #FFF5F5; border: 1px solid #E8B5B2; border-left: 4px solid #C9302C; border-radius: 9px; display: grid; gap: 11px; grid-template-columns: 38px minmax(0, 1fr); margin-bottom: 12px; padding: 14px 15px 14px 12px; }
.provider-revision-request.complete { background: #F4FBF8; border-color: #BFE8D8; border-left-color: var(--green); }
.provider-revision-request__icon { align-items: center; background: #fff; border-radius: 8px; color: #C9302C; display: flex; height: 38px; justify-content: center; width: 38px; }
.provider-revision-request.complete .provider-revision-request__icon { color: #218C69; }
.provider-revision-request > div:last-child > span { color: #B92D29; display: block; font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.provider-revision-request.complete > div:last-child > span { color: #218C69; }
.provider-revision-request h3 { font-size: 14px; margin: 3px 0 5px; }
.provider-revision-request p { color: var(--ink); font-size: 12.5px; line-height: 19px; margin: 0; }
.provider-revision-request small { color: var(--muted); display: block; font-size: 10px; margin-top: 8px; }
.revision-updated-content { background: #fff; border: 1px solid #CFE9DF; border-radius: 9px; overflow: hidden; }
.revision-updated-content > header { align-items: center; background: #F4FBF8; border-bottom: 1px solid #D8EEE5; display: flex; gap: 9px; padding: 11px 13px; }
.revision-updated-content > header > span { align-items: center; background: #fff; border-radius: 7px; color: #218C69; display: flex; height: 30px; justify-content: center; width: 30px; }
.revision-updated-content > header > div { display: flex; flex-direction: column; gap: 2px; }
.revision-updated-content > header strong { font-size: 12px; }
.revision-updated-content > header small { color: #218C69; font-size: 9.5px; }
.revision-updated-content > article { align-items: flex-start; display: flex; gap: 12px; justify-content: space-between; padding: 11px 13px; }
.revision-updated-content > article + article { border-top: 1px solid #EEF1F4; }
.revision-updated-content > article > div { display: flex; flex-direction: column; gap: 3px; }
.revision-updated-content > article strong { font-size: 12px; }
.revision-updated-content > article span { color: var(--muted); font-size: 10.5px; line-height: 16px; }
.revision-updated-content > article em { background: var(--green-soft); border-radius: 999px; color: #218C69; flex-shrink: 0; font-size: 8.5px; font-style: normal; font-weight: 800; padding: 4px 7px; }
.revision-updated-content > p { background: #FBFBFC; border-top: 1px solid #EEF1F4; color: var(--muted); font-size: 10.5px; line-height: 16px; margin: 0; padding: 10px 13px; }
.sage-visit-note { background: #fff; border: 1px solid #C8EAE4; border-radius: 10px; box-shadow: 0 4px 16px rgba(17,124,105,.06); overflow: hidden; }
.sage-visit-note > header { align-items: center; background: #F3FBFA; border-bottom: 1px solid #D6EEE9; display: flex; gap: 10px; padding: 13px 15px; }
.sage-visit-note__icon { align-items: center; background: #fff; border: 1px solid #D5ECE8; border-radius: 8px; color: #147D6B; display: flex; height: 36px; justify-content: center; width: 36px; }
.sage-visit-note > header > div { display: flex; flex: 1; flex-direction: column; gap: 2px; }
.sage-visit-note > header small { color: #147D6B; font-size: 8.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.sage-visit-note > header h3 { color: var(--ink); font-size: 14px; margin: 0; }
.sage-source-pill { align-items: center; background: #E3F6F1; border-radius: 999px; color: #147D6B; display: flex; font-size: 9.5px; font-weight: 800; gap: 4px; padding: 5px 8px; }
.sage-visit-note__meta { border-bottom: 1px solid #EEF2F2; display: grid; gap: 12px 18px; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 12px 15px; }
.sage-visit-note__meta span { display: flex; flex-direction: column; gap: 2px; }
.sage-visit-note__meta small { color: var(--subtle); font-size: 8px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
.sage-visit-note__meta strong { color: var(--ink); font-size: 10.5px; line-height: 15px; }
.sage-visit-note > p { color: #252335; font-size: 14px; line-height: 23px; margin: 0; padding: 17px 18px; white-space: pre-wrap; }
.sage-visit-note > footer { align-items: flex-start; background: #F8F9FA; border-top: 1px solid #EEF1F4; color: #147D6B; display: flex; gap: 8px; padding: 11px 14px; }
.sage-visit-note > footer > svg { margin-top: 1px; }
.sage-visit-note > footer span { color: var(--muted); display: flex; flex-direction: column; font-size: 10.5px; line-height: 16px; }
.sage-visit-note > footer strong { color: var(--ink); font-size: 10.5px; }
.narrative-card { background: #fff; border: 1px solid var(--border); border-radius: 9px; font-size: 14.5px; line-height: 23px; margin-bottom: 12px; padding: 17px 18px; }
.facts-list { display: flex; flex-direction: column; gap: 9px; }
.fact-card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 13px 15px; }
.fact-card.flagged { background: #FFF9F9; border-color: #F5C6C2; }
.fact-row { align-items: flex-start; display: flex; gap: 9px; }
.fact-row > svg { margin-top: 2px; }
.fact-row > span { flex: 1; font-size: 13.5px; line-height: 21px; }
.fact-row > button { align-items: center; background: var(--purple-soft); border: 0; border-radius: 999px; color: var(--purple-dark); cursor: pointer; display: flex; font-size: 11px; font-weight: 700; gap: 4px; padding: 4px 9px; white-space: nowrap; }
.evidence-card { background: #F8F9FA; border: 1px solid #EEF1F4; border-radius: 7px; display: flex; flex-direction: column; gap: 6px; margin: 9px 0 0 24px; padding: 11px 13px; }
.evidence-card q { font-family: "SFMono-Regular", Consolas, monospace; font-size: 11px; line-height: 17px; }
.evidence-card span { color: var(--subtle); font-size: 10.5px; }
.qa-flag { background: #fff; border-left: 3px solid #C9302C; border-radius: 0 7px 7px 0; box-shadow: 0 0 0 1px #F2E7E6; margin: 9px 0 1px 24px; padding: 9px 11px; }
.qa-flag.resolved { background: #F5FCF9; border-left-color: var(--green); box-shadow: 0 0 0 1px #D8EEE5; }
.qa-flag > div:first-child { align-items: center; color: #C9302C; display: flex; font-size: 11px; gap: 6px; }
.qa-flag.resolved > div:first-child { color: #218C69; }
.qa-flag p { font-size: 11px; line-height: 17px; margin: 5px 0 0; }
.flag-actions, .question-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.flag-actions button, .question-actions button { background: #fff; border: 1px solid #D1D5DC; border-radius: 5px; color: var(--ink); cursor: pointer; font-size: 10px; font-weight: 700; padding: 5px 9px; }
.agent-question { background: #FFF8E6; border: 1px solid #F0D294; border-radius: 9px; margin-top: 10px; padding: 13px 15px; }
.agent-question > div:first-child { align-items: center; color: #9A6912; display: flex; font-size: 12px; gap: 7px; }
.agent-question p { font-size: 12px; line-height: 18px; margin: 7px 0 0; }
.agent-question > span { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: inline-flex; font-size: 10px; font-weight: 700; gap: 5px; margin-top: 8px; padding: 5px 9px; }
.review-actions { align-items: center; background: rgba(247,247,247,.96); border-top: 1px solid var(--border); bottom: -36px; display: flex; flex-wrap: wrap; gap: 8px; margin: 18px -30px -36px; padding: 13px 30px 18px; position: sticky; z-index: 4; }
.accepted-section-note { align-items: center; background: var(--green-soft); border: 1px solid #CDEFE6; border-radius: 8px; color: #218C69; display: flex; font-size: 11px; font-weight: 700; gap: 7px; margin-top: 14px; padding: 11px 13px; }
.revision-box { background: #fff; border: 1px solid var(--border); border-radius: 8px; margin-top: 10px; padding: 12px; }
.revision-box label { color: var(--muted); display: block; font-size: 11px; font-weight: 700; margin-bottom: 7px; }
.revision-box textarea { border: 1px solid var(--border); border-radius: 5px; min-height: 70px; padding: 9px; resize: vertical; width: 100%; }
.revision-box button { margin-left: auto; margin-top: 7px; }
.revision-sent { align-items: center; background: var(--purple-soft); border-radius: 999px; color: var(--purple-dark); display: inline-flex; font-size: 11px; font-weight: 700; gap: 6px; margin-top: 10px; padding: 7px 11px; }
.qa-panel { background: #fff; border-left: 1px solid var(--border); overflow-y: auto; padding: 20px; }
.qa-panel__title { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: 13px; }
.qa-panel__title h3 { font-size: 14px; margin: 0 0 3px; }
.qa-panel__title p { color: var(--muted); font-size: 10px; margin: 0; }
.qa-panel__title > span { align-items: center; background: #FFF0F0; border-radius: 999px; color: #C9302C; display: flex; font-size: 11px; font-weight: 800; height: 25px; justify-content: center; min-width: 25px; padding: 0 7px; }
.qa-panel__title > span.clear { background: var(--green-soft); color: #218C69; }
.qa-items { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.qa-items button { align-items: flex-start; background: #FFF8E6; border: 1px solid #F0D294; border-radius: 7px; color: #9A6912; cursor: pointer; display: grid; gap: 7px; grid-template-columns: 14px 1fr auto; padding: 8px 9px; text-align: left; }
.qa-items button:not(.resolved):has(svg:first-child) { color: #9A6912; }
.qa-items button.resolved { background: var(--green-soft); border-color: #CDEFE6; color: #218C69; }
.qa-items button span { color: inherit; display: flex; flex-direction: column; gap: 2px; }
.qa-items button strong { font-size: 11px; }
.qa-items button small { color: var(--muted); font-size: 10px; line-height: 14px; }
.qa-items button em { color: var(--subtle); font-size: 9.5px; font-style: normal; font-weight: 700; }
.provider-revision-nav { align-items: flex-start; background: #FFF5F5; border: 1px solid #E8B5B2; border-radius: 9px; color: var(--ink); cursor: pointer; display: grid; gap: 9px; grid-template-columns: 32px minmax(0, 1fr); margin-bottom: 11px; padding: 11px; text-align: left; width: 100%; }
.provider-revision-nav.complete { background: #F4FBF8; border-color: #BFE8D8; }
.provider-revision-nav > span { align-items: center; background: #fff; border-radius: 7px; color: #C9302C; display: flex; height: 32px; justify-content: center; width: 32px; }
.provider-revision-nav.complete > span { color: #218C69; }
.provider-revision-nav > div { min-width: 0; }
.provider-revision-nav small { color: #B92D29; display: block; font-size: 8px; font-weight: 800; letter-spacing: .055em; text-transform: uppercase; }
.provider-revision-nav strong { display: block; font-size: 12px; margin-top: 2px; }
.provider-revision-nav p { color: var(--muted); display: -webkit-box; font-size: 10px; line-height: 15px; margin: 5px 0 0; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
.accepted-summary { align-items: flex-start; background: #F5FCF9; border: 1px solid #D8EEE5; border-radius: 9px; display: grid; gap: 9px; grid-template-columns: 28px 1fr; margin-bottom: 18px; padding: 11px; }
.accepted-summary > span { align-items: center; color: #218C69; display: flex; height: 28px; justify-content: center; }
.accepted-summary strong { font-size: 11px; }
.accepted-summary p { color: var(--muted); font-size: 9.5px; line-height: 14px; margin: 3px 0 0; }
.sources-toggle { align-items: center; background: #F8F9FA; border: 1px solid #EEF1F4; border-radius: 7px; color: var(--muted); cursor: pointer; display: flex; justify-content: space-between; padding: 9px 10px; text-align: left; width: 100%; }
.sources-toggle > span { align-items: center; display: grid; gap: 0 7px; grid-template-columns: 18px 1fr; }
.sources-toggle b { color: var(--ink); font-size: 11px; }
.sources-toggle small { color: var(--subtle); font-size: 8.5px; grid-column: 2; margin-top: 2px; }
.source-list { display: flex; flex-direction: column; gap: 5px; margin-top: 7px; }
.source-list > span { align-items: center; border: 1px solid #EEF1F4; border-radius: 7px; display: flex; gap: 7px; padding: 7px; }
.source-list i { align-items: center; border-radius: 5px; display: flex; height: 23px; justify-content: center; width: 23px; }
.source-list i.purple { background: var(--purple-soft); color: var(--purple-dark); }
.source-list i.blue { background: #E6F3FB; color: #0076A8; }
.source-list i.green { background: var(--green-soft); color: #218C69; }
.source-list i.gold { background: #FFF8E6; color: #9A6912; }
.source-list i.teal { background: #E3F6F1; color: #147D6B; }
.source-list b { flex: 1; font-size: 11px; }
.source-list em { color: var(--subtle); font-size: 9.5px; font-style: normal; }
.review-footer { align-items: center; background: #fff; border-top: 1px solid var(--border); display: flex; flex: 0 0 66px; gap: 11px; height: 66px; padding: 11px 18px; }
.review-progress { min-width: 170px; }
.review-progress span { color: var(--muted); display: block; font-size: 11px; margin-bottom: 5px; }
.review-progress span strong { color: var(--ink); }
.review-progress > i { background: #EEEEEE; border-radius: 999px; display: block; height: 5px; overflow: hidden; }
.review-progress > i b { background: var(--mint); display: block; height: 100%; transition: width 180ms; }
.blockers { align-items: center; color: #C9302C; display: flex; flex: 1; font-size: 11px; gap: 5px; }
.blockers.ready { color: #218C69; font-weight: 700; }
.footer-nav { align-items: center; background: #fff; border: 1px solid #D1D5DC; border-radius: 5px; color: var(--ink); cursor: pointer; display: flex; font-size: 11px; font-weight: 700; gap: 4px; height: 34px; padding: 0 9px; }
.footer-nav:disabled { color: var(--subtle); cursor: not-allowed; }
.review-footer .button { min-height: 40px; }
.review-note-button { min-width: 132px; }
.review-toast { background: var(--ink); border-radius: 7px; bottom: 70px; color: #fff; font-size: 11px; font-weight: 700; left: 50%; padding: 10px 14px; position: fixed; transform: translateX(-50%); z-index: 80; }
.reveal-enter-active, .reveal-leave-active { transition: opacity 140ms, transform 140ms; }
.reveal-enter-from, .reveal-leave-to { opacity: 0; transform: translateY(-4px); }
.toast-enter-active, .toast-leave-active { transition: opacity 150ms; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
@media (max-width: 1200px) {
  .review-workspace { grid-template-columns: 190px minmax(420px, 1fr); }
  .qa-panel { display: none; }
}
@media (max-width: 1000px) {
  .pipeline-steps { display: none; }
  .review-workspace { grid-template-columns: 170px minmax(360px, 1fr); }
  .patient-header > div > span { display: none; }
  .blockers { display: none; }
}
@media (max-width: 720px) {
  .review-page { height: calc(100dvh - 58px); }
  .encounter-navigation-bar { min-height: 46px; padding: 8px 14px; }
  .patient-header { padding: 11px 14px 10px; }
  .patient-header .agent-ready { display: none; }
  .review-workspace { display: flex; flex-direction: column; overflow: auto; }
  .section-nav { border-bottom: 1px solid var(--border); border-right: 0; display: flex; flex-shrink: 0; overflow-x: auto; padding: 7px; }
  .section-nav__header { display: none; }
  .section-nav button { flex: 0 0 auto; margin: 0 3px 0 0; width: auto; }
  .section-nav button > i { display: none; }
  .note-panel { overflow: visible; padding: 18px 14px 24px; }
  .section-title { display: block; }
  .section-title > .reviewed-chip, .section-title > .provider-revision-chip, .section-title > .attention-chip, .section-title > .ready-chip { margin: 0 0 12px; width: max-content; }
  .section-context { align-items: flex-start; flex-direction: column; gap: 7px; }
  .sage-visit-note__meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fact-row { flex-wrap: wrap; }
  .fact-row > button { margin-left: 24px; }
  .review-footer { flex-wrap: nowrap; min-height: 64px; padding: 9px 12px; }
  .review-progress { flex: 1; }
  .footer-nav { display: none; }
  .review-actions { bottom: 0; margin: 18px -14px 0; padding: 10px 14px 12px; position: sticky; }
}
@media (max-width: 480px) {
  .review-actions .button { flex: 1 1 calc(50% - 4px); padding: 0 10px; width: auto; }
  .review-actions .button:first-child { flex-basis: 100%; }
  .review-footer .button { flex-shrink: 0; min-width: 128px; padding: 0 12px; width: auto; }
}
</style>
