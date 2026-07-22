<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { buildClinicalIntelligence } from '../data/clinicalIntelligence'
import { socialHistoryGroups } from '../data/editorData'
import { allEncounters } from '../data/portalData'
import { encounterDraft, encounterWorkflowState, recordClarificationRequest, recordEncounterSent } from '../stores/encounterDraft'
import { formatPatientName } from '../utils/patientName'

const route = useRoute()
const router = useRouter()
const confirmSend = ref(false)
const toast = ref('')
const openEvidenceSections = ref([])
const clarificationTarget = ref(null)
const clarificationQuestion = ref('')

const encounter = computed(() => allEncounters.find((item) => item.id === route.params.id) || allEncounters[1])
const sent = computed(() => Boolean(encounterWorkflowState.sentEncounters[encounter.value.id]))
const documentPatientName = computed(() => formatPatientName(encounter.value.patient, encounter.value.sex))
const editedSectionIds = computed(() => encounterWorkflowState.editedSections[encounter.value.id] || [])
const intelligence = computed(() => buildClinicalIntelligence(
  encounter.value,
  editedSectionIds.value,
  encounterWorkflowState.correctionFeedback || [],
))
const finalSections = computed(() => intelligence.value.sections)
const resolvedReviewChecks = computed(() => intelligence.value.reviewChecks)
const openReviewChecks = computed(() => resolvedReviewChecks.value.filter((check) => !check.resolved))
const currentClarification = computed(() => encounterWorkflowState.clarificationRequests?.[encounter.value.id] || null)
const clarificationPending = computed(() => currentClarification.value?.status === 'awaiting-provider')
const canSend = computed(() => openReviewChecks.value.length === 0 && !clarificationPending.value)

const socialItems = computed(() => socialHistoryGroups
  .map((group) => ({ label: group.label, value: encounterDraft.social.selections[group.key], detail: encounterDraft.social.details[group.key] }))
  .filter((item) => item.value))

const rosItems = computed(() => Object.entries(encounterDraft.ros.findings)
  .map(([system, findings]) => ({
    system,
    present: Object.entries(findings || {})
      .filter(([, state]) => state === 'positive')
      .map(([symptom]) => ({ name: symptom, note: encounterDraft.ros.notesBySymptom?.[`${system}:${symptom}`] || '' })),
    denied: Object.entries(findings || {})
      .filter(([, state]) => state === 'negative')
      .map(([symptom]) => ({ name: symptom, note: encounterDraft.ros.notesBySymptom?.[`${system}:${symptom}`] || '' })),
    notes: encounterDraft.ros.notesBySystem?.[system] || '',
  }))
  .filter((item) => item.present.length || item.denied.length || item.notes))

const rosSourceAnswer = computed(() => {
  const source = String(encounterDraft.ros.source || '').toLowerCase()
  if (source.includes('staff') || source.includes('caregiver') || source.includes('indirect')) return 'Yes. But not directly from patient'
  if (source.includes('direct')) return 'Yes. Directly from patient'
  if (source.includes('unable')) {
    const reason = encounterDraft.ros.unableReasonDetail || encounterDraft.ros.unableReason
    return reason ? `No. Unable to obtain (${reason})` : 'No. Unable to obtain'
  }
  return encounterDraft.ros.source || 'Not documented'
})

const activePeDevices = computed(() => Object.entries(encounterDraft.pe.devices || {}).filter(([, selected]) => selected).map(([name]) => name))

function isPeFindingAbnormal(finding) {
  if (finding.polarity === 'normal_when_present') return finding.state === 'negative'
  if (finding.polarity === 'abnormal_when_present') return finding.state === 'positive'
  const value = String(finding.value || '').toLowerCase()
  return ['abnormal', 'irregular', 'not intact', 'not equal', 'amputated', 'unsteady'].some((term) => value.includes(term))
}

function isCriticalAllergy(allergy) {
  const severity = String(allergy.severity || '').toLowerCase()
  const reaction = `${allergy.reaction || ''} ${allergy.reactionSubType || ''}`.toLowerCase()
  const criticality = String(allergy.criticality || '').toLowerCase()
  return severity === 'severe' || reaction.includes('anaphyl') || criticality === 'high'
}

function isHighRiskScreening(screening) {
  const score = Number.parseFloat(screening.score)
  if (screening.type === 'morse') return Number.isFinite(score) && score >= 40
  if (screening.type === 'tug') return Number.isFinite(score) && score >= 12
  if (screening.type === 'phq9') return Number.isFinite(score) && score >= 5
  return /moderate risk|high risk|severe|positive/i.test(String(screening.result || ''))
}

function screeningResult(screening) {
  if (screening.type !== 'tug') return screening.result
  const seconds = Number.parseFloat(screening.score)
  if (!Number.isFinite(seconds)) return screening.result
  return seconds >= 12 ? 'Fall Risk (≥12s)' : 'Normal Mobility'
}

function isVitalOutOfRange(vital) {
  return ['high', 'low', 'abnormal', 'out-of-range'].includes(String(vital.status || '').toLowerCase())
}

function isEvidenceOpen(sectionId) {
  return openEvidenceSections.value.includes(sectionId)
}

function toggleEvidence(sectionId) {
  openEvidenceSections.value = isEvidenceOpen(sectionId)
    ? openEvidenceSections.value.filter((id) => id !== sectionId)
    : [...openEvidenceSections.value, sectionId]
}

function sectionSources(section) {
  return [...new Set(section.facts.map((fact) => fact.source))]
}

function editSection(sectionId) {
  router.push({ path: `/encounters/${encounter.value.id}`, query: { section: sectionId } })
}

function openClarification(section) {
  if (clarificationPending.value) return
  clarificationTarget.value = section
  clarificationQuestion.value = ''
}

function closeClarification() {
  clarificationTarget.value = null
  clarificationQuestion.value = ''
}

function submitClarification() {
  const question = clarificationQuestion.value.trim()
  if (!clarificationTarget.value || !question) return
  recordClarificationRequest(encounter.value.id, {
    sectionId: clarificationTarget.value.id,
    sectionLabel: clarificationTarget.value.label,
    question,
    provider: encounter.value.provider || 'Dr. A. Patel',
    medicalPractice: encounter.value.medicalPractice,
    facility: encounter.value.facility,
  })
  const sectionLabel = clarificationTarget.value.label
  closeClarification()
  showToast(`${sectionLabel} clarification routed to Otangeles Operations`)
  window.setTimeout(() => router.push({ path: '/encounters', query: { view: 'provider', highlight: encounter.value.id } }), 900)
}

function peFindingSupplement(finding) {
  const parts = []
  const documentedChildStates = Object.entries(finding.detailStates || {}).filter(([, state]) => state && state !== 'unset')

  if (documentedChildStates.length) {
    parts.push(...documentedChildStates.map(([name, state]) => `${name}: ${state === 'positive' ? 'Present' : 'Absent'}`))
  } else if (finding.selectedDetails?.length) {
    parts.push(...finding.selectedDetails)
  }

  Object.entries(finding.childSelections || {}).forEach(([name, selection]) => {
    const value = Array.isArray(selection) ? selection.join(', ') : selection
    if (value) parts.push(`${name}: ${value}`)
  })

  if (finding.detail) parts.push(finding.detail)
  return parts.join(' · ')
}

function confirmProviderSend() {
  if (!canSend.value) return
  recordEncounterSent(encounter.value.id, encounter.value.provider || 'Dr. A. Patel')
  confirmSend.value = false
  showToast(`Encounter sent to ${encounter.value.provider || 'Dr. A. Patel'}`)
  window.setTimeout(() => router.push('/encounters'), 900)
}

function showToast(message) {
  toast.value = message
  window.setTimeout(() => { if (toast.value === message) toast.value = '' }, 2400)
}
</script>

<template>
  <section class="document-preview-page">
    <header class="preview-header">
      <div>
        <button type="button" @click="router.push('/encounters')">Encounters</button>
        <AppIcon name="chevronRight" :size="14" color="#99A1AF" />
        <span class="mono">{{ encounter.id }}</span>
        <AppIcon name="chevronRight" :size="14" color="#99A1AF" />
        <strong>Final Note Review</strong>
      </div>
      <span :class="{ 'needs-attention': !canSend }"><AppIcon :name="canSend ? 'checkCheck' : (clarificationPending ? 'clock' : 'alert')" :size="14" /> {{ clarificationPending ? 'Awaiting provider clarification' : (canSend ? 'Ready for provider' : `${openReviewChecks.length} review check${openReviewChecks.length === 1 ? ' needs' : 's need'} attention`) }}</span>
    </header>

    <div class="preview-workspace">
      <main class="preview-scroll">
        <section class="review-readiness" :class="{ 'needs-attention': !canSend }" aria-label="Final review readiness">
          <div><span><AppIcon :name="canSend ? 'checkCheck' : (clarificationPending ? 'clock' : 'alert')" :size="18" /></span><p><strong>{{ clarificationPending ? `Clarification requested for ${currentClarification.sectionLabel}` : `${finalSections.length} AI-completed sections ready to verify` }}</strong><small>{{ clarificationPending ? `${currentClarification.routedVia} is contacting ${currentClarification.provider}. This encounter will return to Final Review when the answer is recorded.` : (canSend ? 'Check each section against its cited evidence, then send the encounter to the provider.' : 'Review the flagged sections, verify the cited evidence, and correct only what needs attention.') }}</small></p></div>
          <dl><div><dt>Sections</dt><dd>{{ finalSections.length }} ready</dd></div><div><dt>Confidence</dt><dd>{{ intelligence.averageConfidence }}% avg</dd></div><div><dt>Review checks</dt><dd>{{ resolvedReviewChecks.filter((check) => check.resolved).length }} passed</dd></div><div><dt>Exceptions</dt><dd>{{ openReviewChecks.length }}</dd></div></dl>
        </section>

        <article class="document-paper">
          <header class="document-facility">
            <strong>{{ encounter.facility }}</strong>
            <span>911 S 3rd St, Niles, MI 49120-3414</span>
            <span>Tel: (269) 684-4123 · Fax: (269) 684-6744</span>
          </header>

          <section class="document-patient">
            <h1>{{ documentPatientName }}</h1>
            <p><span>Rec ID:</span> {{ encounter.id }} <i>·</i> <span>DoB (Age):</span> {{ encounter.dobAge || '09/08/1943 (82)' }}</p>
          </section>

          <h2 class="document-title">Progress Notes</h2>

          <div class="document-sections">
            <section v-for="item in finalSections" :key="item.id" class="document-section">
              <header>
                <h3>{{ item.label }}</h3>
                <div class="document-section__header-actions">
                  <span :class="`confidence-${item.confidence.toLowerCase()}`"><AppIcon name="shield" :size="10" /> {{ item.score }}% confidence</span>
                  <button type="button" :disabled="clarificationPending" @click="openClarification(item)"><AppIcon name="message" :size="12" /> {{ clarificationPending ? 'Clarification pending' : 'Request clarification' }}</button>
                </div>
              </header>

              <div v-if="item.id === 'code'" class="document-body">
                <ul><li><strong>{{ encounterDraft.code.status }}</strong></li></ul>
                <p v-if="encounterDraft.code.notes">{{ encounterDraft.code.notes }}</p>
              </div>

              <div v-else-if="item.id === 'cc'" class="document-body">
                <p><strong>Reason for visit:</strong> {{ encounterDraft.cc.reasonForVisit }}</p>
                <p>{{ encounterDraft.cc.complaint }}</p>
                <div class="inline-tags"><span v-for="item in encounterDraft.cc.necessity" :key="item">{{ item }}</span></div>
                <div v-if="encounterDraft.cc.necessity.includes('Re-admission')" class="document-subgrid"><span><strong>Prior discharge</strong>{{ encounterDraft.cc.readmission.priorDischargeDate || 'Not documented' }}</span><span><strong>Prior facility</strong>{{ encounterDraft.cc.readmission.facility || 'Not documented' }}</span><span><strong>Reason</strong>{{ encounterDraft.cc.readmission.reason || 'Not documented' }}</span><span><strong>Hospitalized since last visit</strong>{{ encounterDraft.cc.readmission.hospitalizationSinceLastVisit }}</span></div>
              </div>

              <div v-else-if="item.id === 'hpi'" class="document-body">
                <p>{{ encounterDraft.hpi.note }}</p>
                <div v-if="encounterDraft.hpi.style === 'structured'" class="document-subgrid"><span v-for="(value, key) in encounterDraft.hpi.structured" :key="key"><strong>{{ key.replace(/([A-Z])/g, ' $1') }}</strong>{{ value || 'Not documented' }}</span></div>
              </div>

              <div v-else-if="item.id === 'pmh'" class="document-body"><ul><li v-for="problem in encounterDraft.pmh.problems" :key="problem">{{ problem }}</li></ul><p v-if="encounterDraft.pmh.notes" class="document-note document-note--neutral">{{ encounterDraft.pmh.notes }}</p></div>

              <div v-else-if="item.id === 'psh'" class="document-body">
                <p v-if="encounterDraft.psh.noPrior">No prior surgeries documented.</p>
                <ul v-else><li v-for="surgery in encounterDraft.psh.surgeries" :key="surgery">{{ surgery }}</li></ul>
                <p v-if="encounterDraft.psh.notes">{{ encounterDraft.psh.notes }}</p>
              </div>

              <div v-else-if="item.id === 'social'" class="document-body two-column-list">
                <div v-for="entry in socialItems" :key="entry.label"><strong>{{ entry.label }}</strong><span>{{ entry.value }}<template v-if="entry.detail"> — {{ entry.detail }}</template></span></div>
                <p v-if="encounterDraft.social.notes" class="full-width-note">{{ encounterDraft.social.notes }}</p>
              </div>

              <div v-else-if="item.id === 'family'" class="document-body">
                <p v-if="encounterDraft.family.noContribution">No contributing family history.</p>
                <ul v-else><li v-for="relative in encounterDraft.family.relatives" :key="relative.relationship"><strong>{{ relative.relationship }}:</strong> {{ relative.conditions.join(', ') || 'No conditions documented' }}<template v-if="relative.cancerSubtype"> ({{ relative.cancerSubtype }} cancer)</template><template v-if="relative.ageOfOnset">; onset age {{ relative.ageOfOnset }}</template><template v-if="relative.deceased === 'Yes'">; deceased age {{ relative.age }}</template><template v-if="relative.contributory">; contributory to current complaint</template><template v-if="relative.notes"> — {{ relative.notes }}</template></li></ul>
                <p v-if="encounterDraft.family.notes">{{ encounterDraft.family.notes }}</p>
              </div>

              <div v-else-if="item.id === 'immunizations'" class="document-body">
                <p><strong>History:</strong> {{ encounterDraft.immunizations.history }}</p>
                <div v-if="encounterDraft.immunizations.history === 'Document Vaccines Present'" class="two-column-list"><div v-for="vaccine in encounterDraft.immunizations.vaccines" :key="vaccine.name"><strong>{{ vaccine.name }}</strong><span>{{ vaccine.date || 'Date not recorded' }}</span></div></div>
                <p v-if="encounterDraft.immunizations.notes">{{ encounterDraft.immunizations.notes }}</p>
              </div>

              <div v-else-if="item.id === 'vitals'" class="document-body vitals-document-grid">
                <p class="vitals-meta"><strong>Recorded:</strong> {{ encounterDraft.vitals.recordedAt }} · <strong>Oxygen method:</strong> {{ encounterDraft.vitals.oxygenMethod }}</p>
                <div v-for="vital in encounterDraft.vitals.values" :key="vital.key" :class="{ abnormal: isVitalOutOfRange(vital) }"><strong>{{ vital.label }}</strong><span>{{ vital.value }} {{ vital.unit }}<template v-if="isVitalOutOfRange(vital)"> (Out of Range)</template></span></div>
                <p v-if="encounterDraft.vitals.notes">{{ encounterDraft.vitals.notes }}</p>
              </div>

              <div v-else-if="item.id === 'allergies'" class="document-body">
                <p v-if="encounterDraft.allergies.historyType !== 'Reported allergies'">{{ encounterDraft.allergies.historyType }}</p>
                <p v-if="encounterDraft.allergies.reviewed"><strong>Medication reconciliation:</strong> Allergy list reviewed and verified.</p>
                <ul v-if="encounterDraft.allergies.historyType === 'Reported allergies'" class="allergies-preview-list"><li><strong class="allergies-reported-label">Reported</strong><ul><li v-for="allergy in encounterDraft.allergies.items" :key="allergy.allergen" :class="{ 'allergy-critical': isCriticalAllergy(allergy) }"><strong>{{ allergy.allergen }}</strong> — {{ allergy.category }} · {{ allergy.type }} · {{ allergy.reaction }}<template v-if="allergy.reactionSubType"> / {{ allergy.reactionSubType }}</template> ({{ allergy.severity }}, {{ allergy.status }})<template v-if="allergy.onsetDate">; onset {{ allergy.onsetDate }}</template><template v-if="allergy.notes"> — {{ allergy.notes }}</template></li></ul></li></ul>
              </div>

              <div v-else-if="item.id === 'meds'" class="document-body table-wrap">
                <table><thead><tr><th>Medication</th><th>Directions</th><th>Route / Frequency</th><th>Rx details</th><th>Status</th></tr></thead><tbody><tr v-for="med in encounterDraft.meds.items" :key="med.name"><td>{{ med.name }}<br><small>{{ med.strength }} {{ med.form }}</small></td><td>{{ med.direction }}</td><td>{{ med.route }} · {{ med.frequency }}</td><td>Qty {{ med.quantity }} {{ med.unit }} · {{ med.refills || 0 }} refills<template v-if="med.startDate"><br>Start {{ med.startDate }}</template></td><td>{{ med.status }}<template v-if="med.pharmacyNotes"><br><small>{{ med.pharmacyNotes }}</small></template></td></tr></tbody></table>
                <p v-if="encounterDraft.meds.notes" class="document-note">{{ encounterDraft.meds.notes }}</p>
              </div>

              <div v-else-if="item.id === 'ros'" class="document-body">
                <p class="ros-question"><strong>Are you able to obtain Review of Systems (RoS) findings?</strong></p>
                <ul class="ros-source-answer"><li>{{ rosSourceAnswer }}</li></ul>
                <template v-if="encounterDraft.ros.otherSources.length"><p class="ros-subheading"><strong>Who provided the information for this encounter?</strong></p><ul><li v-for="source in encounterDraft.ros.otherSources" :key="source">{{ source }}</li></ul></template>
                <p class="ros-subheading"><strong>Systems Review</strong></p>
                <p v-if="encounterDraft.ros.deniesAll">Patient denies all reviewed symptoms.</p>
                <ul v-else class="ros-document"><li v-for="line in rosItems" :key="line.system"><strong>{{ line.system }}:</strong><ul><li v-if="line.denied.length"><b>Denies:</b> Patient denies <span v-for="(symptom, index) in line.denied" :key="symptom.name">{{ symptom.name }}<template v-if="symptom.note"> (Notes: {{ symptom.note }})</template><template v-if="index < line.denied.length - 1">, </template></span></li><li v-if="line.present.length" class="ros-reported"><b>Reports:</b> Patient reported <span v-for="(symptom, index) in line.present" :key="symptom.name">{{ symptom.name }}<template v-if="symptom.note"> (Notes: {{ symptom.note }})</template><template v-if="index < line.present.length - 1">, </template></span></li><li v-if="line.notes"><b>Note:</b> {{ line.notes }}</li></ul></li></ul>
                <p v-if="encounterDraft.ros.notes"><strong>Note:</strong> {{ encounterDraft.ros.notes }}</p>
              </div>

              <div v-else-if="item.id === 'pe'" class="document-body pe-document">
                <p class="pe-heading"><strong>Exam Findings</strong></p>
                <ul class="pe-categories"><li v-for="group in encounterDraft.pe.groups" :key="group.name" class="pe-category"><strong>{{ group.name }}:</strong><ul><li v-for="finding in group.findings" :key="finding.name" :class="{ 'pe-abnormal': isPeFindingAbnormal(finding) }"><b>{{ finding.name }}</b><template v-if="finding.value">: {{ finding.value }}</template><template v-if="finding.laterality"> ({{ finding.laterality }})</template><template v-if="peFindingSupplement(finding)"> — {{ peFindingSupplement(finding) }}</template></li><li v-if="group.notes" class="pe-abnormal"><b>Notes:</b> {{ group.notes }}</li></ul></li><li v-if="activePeDevices.length" class="pe-category pe-abnormal"><strong>Devices / Treatments:</strong><ul><li v-for="device in activePeDevices" :key="device">{{ device }}</li><li v-if="encounterDraft.pe.oxygenFlowRate">O₂ {{ encounterDraft.pe.oxygenFlowRate }}</li><li v-if="encounterDraft.pe.deviceNotes"><b>Notes:</b> {{ encounterDraft.pe.deviceNotes }}</li></ul></li></ul>
                <p v-if="encounterDraft.pe.notes" class="pe-abnormal"><strong>Notes:</strong> {{ encounterDraft.pe.notes }}</p>
              </div>

              <div v-else-if="item.id === 'labs'" class="document-body">
                <div v-for="result in encounterDraft.labs.diagnostics" :key="result.name" class="diagnostic-line"><strong>{{ result.name }}</strong><span>{{ result.date }} · {{ result.summary }}</span></div>
                <p><strong>Laboratory:</strong> {{ encounterDraft.labs.laboratoryNotes }}</p>
                <p><strong>Imaging:</strong> {{ encounterDraft.labs.imagingNotes }}</p>
              </div>

              <div v-else-if="item.id === 'ap'" class="document-body assessment-document">
                <article v-for="problem in encounterDraft.ap.problems" :key="problem.code"><header><strong>{{ problem.code }} — {{ problem.diagnosis }}</strong><span>{{ problem.status }}</span></header><p><b>Assessment:</b> {{ problem.assessment }}</p><p><b>Plan:</b> {{ problem.plan }}</p><p><b>Treatments:</b> {{ problem.treatments.join(', ') || 'None documented' }}</p><p><b>Execution:</b> {{ problem.action || 'Not specified' }} · {{ problem.responsibleParty || 'Responsible party not specified' }} · {{ problem.timing || 'Timing not specified' }}</p><p v-if="problem.followUp"><b>Follow-up:</b> {{ problem.followUp }}</p></article>
                <p class="mdm"><strong>Medical Decision Making:</strong> {{ encounterDraft.ap.medicalDecision }}</p>
              </div>

              <div v-else-if="item.id === 'notes'" class="document-body visit-note-document">
                <span><AppIcon name="activity" :size="11" /> {{ encounterDraft.notes.sourceLabel }} · {{ encounterDraft.notes.source }} · {{ encounterDraft.notes.inputMethod }}</span>
                <p>{{ encounterDraft.notes.text }}</p>
              </div>

              <div v-else-if="item.id === 'screenings'" class="document-body screening-document"><article v-for="screening in encounterDraft.screenings.items" :key="screening.name"><header><strong>{{ screening.name }}</strong><span>{{ screening.completed ? 'Completed' : 'Incomplete' }}</span></header><p :class="{ 'screening-high-risk': isHighRiskScreening(screening) }">{{ screening.score }}<template v-if="screening.unit">&nbsp;{{ screening.unit }}</template> · {{ screeningResult(screening) }} · {{ screening.completedAt }}</p><small v-if="screening.detail">{{ screening.detail }}</small><small v-if="screening.observations?.length">Observations: {{ screening.observations.join(', ') }}</small><small v-if="screening.needs?.length">Identified needs: {{ screening.needs.join(', ') }}</small><small v-if="screening.difficulty">Difficulty: {{ screening.difficulty }}</small></article></div>

              <div v-else-if="item.id === 'cpt'" class="document-body"><ul><li v-for="code in encounterDraft.cpt.codes" :key="code.code"><strong>{{ code.code }}<template v-if="code.modifiers">-{{ code.modifiers }}</template></strong> — {{ code.description }}</li></ul></div>

              <button type="button" class="section-evidence-toggle" :aria-expanded="isEvidenceOpen(item.id)" @click="toggleEvidence(item.id)">
                <span><AppIcon name="clipboard" :size="12" /><b>Evidence</b><small>{{ sectionSources(item).join(', ') }}</small></span>
                <span>{{ item.facts.length }} link{{ item.facts.length === 1 ? '' : 's' }} <AppIcon :name="isEvidenceOpen(item.id) ? 'chevronUp' : 'chevronDown'" :size="12" /></span>
              </button>
              <Transition name="evidence-reveal">
                <div v-if="isEvidenceOpen(item.id)" class="section-evidence-list">
                  <article v-for="fact in item.facts" :key="fact.text">
                    <header><strong>{{ fact.source }}</strong><span>{{ fact.ref }}</span></header>
                    <p>{{ fact.text }}</p>
                    <q>{{ fact.quote }}</q>
                  </article>
                </div>
              </Transition>
            </section>
          </div>
        </article>
      </main>

      <aside class="preview-sidebar">
        <div class="preview-sidebar__scroll">
          <header><span>Provider handoff</span><h2>{{ encounter.id }}</h2><p>{{ formatPatientName(encounter.patient, encounter.sex) }} · {{ encounter.visit }}</p></header>
          <button type="button" class="sidebar-edit" @click="editSection('code')"><AppIcon name="edit" :size="14" /> Edit a section</button>

          <section class="sidebar-card review-checks-card">
            <div class="sidebar-card__title"><h3>Review checks</h3><span class="ready-pill" :class="{ blocked: openReviewChecks.length }"><AppIcon :name="openReviewChecks.length ? 'alert' : 'check'" :size="11" /> {{ openReviewChecks.length ? `${openReviewChecks.length} open` : 'Clear' }}</span></div>
            <p class="review-checks-intro">AI surfaced only the section issues that may need your judgment.</p>
            <div class="review-check-list">
              <article v-for="check in resolvedReviewChecks" :key="check.key" :class="{ resolved: check.resolved }">
                <span><AppIcon :name="check.resolved ? 'check' : 'alert'" :size="12" /></span>
                <div><strong>{{ check.title }}</strong><small v-if="check.sectionLabel">{{ check.sectionLabel }}</small><p>{{ check.detail }}</p><em>{{ check.source }}</em></div>
                <button v-if="!check.resolved && check.sectionId" type="button" @click="editSection(check.sectionId)">Edit <AppIcon name="chevronRight" :size="11" /></button>
              </article>
            </div>
          </section>

          <details class="sidebar-more">
            <summary><span><AppIcon name="sparkles" :size="13" /><b>How AI completed this encounter</b></span><AppIcon name="chevronDown" :size="12" /></summary>
            <div class="sidebar-more__content">
              <section class="sidebar-card">
                <div class="sidebar-card__title"><h3>Specialized agents</h3><small>{{ intelligence.agents.length }} agents</small></div>
                <p class="review-checks-intro">Each agent completed a specific part of the encounter.</p>
                <div class="agent-trace-list">
                  <details v-for="agent in intelligence.agents" :key="agent.id">
                    <summary><span><AppIcon :name="agent.icon" :size="12" /></span><b>{{ agent.name }}</b><em>{{ agent.output }}</em><AppIcon name="chevronDown" :size="11" /></summary>
                    <p>{{ agent.responsibility }}</p>
                  </details>
                </div>
              </section>

              <section class="sidebar-card learning-card">
                <div class="sidebar-card__title"><h3>Learning feedback</h3><span class="ready-pill"><AppIcon name="refresh" :size="11" /> {{ intelligence.feedback.length }} captured</span></div>
                <p v-if="!intelligence.feedback.length">Every human correction is stored with its before/after value, reason, actor, and model version for the learning pipeline.</p>
                <div v-else class="learning-feedback-list">
                  <article v-for="feedback in intelligence.feedback.slice().reverse().slice(0, 3)" :key="feedback.id"><strong>{{ finalSections.find((section) => section.id === feedback.sectionId)?.label || feedback.sectionId }}</strong><span>{{ feedback.reason }}</span><small>{{ feedback.modelVersion }} · {{ feedback.actor }}</small></article>
                </div>
              </section>

              <section class="sidebar-card">
                <div class="sidebar-card__title"><h3>Sources pulled</h3><small>Synced 08:31 AM</small></div>
                <div class="preview-sources">
                  <span><i class="teal"><AppIcon name="activity" :size="13" /></i><b>SITES Provider Visit Note</b><em>Voice · 04:18</em></span>
                  <span><i class="purple"><AppIcon name="clipboard" :size="13" /></i><b>PCC Clinical Record</b><em>Current</em></span>
                  <span><i class="blue"><AppIcon name="activity" :size="13" /></i><b>Encounter Transcript</b><em>12:48</em></span>
                  <span><i class="green"><AppIcon name="pill" :size="13" /></i><b>eMAR</b><em>Synced</em></span>
                  <span><i class="gold"><AppIcon name="users" :size="13" /></i><b>Nursing Notes</b><em>3 notes</em></span>
                </div>
              </section>
            </div>
          </details>
        </div>

        <footer>
          <span v-if="!sent" :class="{ blocked: !canSend }"><AppIcon :name="canSend ? 'checkCheck' : (clarificationPending ? 'clock' : 'alert')" :size="13" /> {{ clarificationPending ? `Waiting for ${currentClarification.provider}` : (canSend ? (encounter.revision ? 'Revision ready to return to provider' : 'Ready for provider review') : `${openReviewChecks.length} review check${openReviewChecks.length === 1 ? '' : 's'} must be resolved`) }}</span>
          <span v-else class="sent-status"><AppIcon name="checkCheck" :size="13" /> Sent to {{ encounter.provider || 'Dr. A. Patel' }}</span>
          <button type="button" class="button" :class="sent ? 'button--soft' : 'button--mint'" :disabled="sent || !canSend" @click="confirmSend = true"><AppIcon :name="sent ? 'check' : 'send'" :size="15" /> {{ sent ? 'Sent to Provider' : 'Send to Provider' }}</button>
        </footer>
      </aside>
    </div>

    <div v-if="clarificationTarget" class="clarification-scrim" @click.self="closeClarification">
      <section class="clarification-sheet" role="dialog" aria-modal="true" aria-labelledby="clarification-title">
        <div class="clarification-sheet__handle" />
        <header><h2 id="clarification-title">Request clarification · {{ clarificationTarget.label }}</h2><button type="button" aria-label="Close clarification request" @click="closeClarification"><AppIcon name="x" :size="20" /></button></header>
        <p class="clarification-summary">This request applies only to {{ clarificationTarget.label }}. The encounter will be locked while Otangeles Operations obtains an answer from the submitted provider.</p>
        <div class="clarification-route">
          <span><AppIcon name="users" :size="18" /></span>
          <div><small>Delivery route</small><strong>Otangeles Operations → {{ encounter.provider || 'Dr. A. Patel' }}</strong><p>{{ encounter.medicalPractice }} · External providers do not need a Scribe Portal account.</p></div>
        </div>
        <label class="clarification-field"><span>Question for provider</span><textarea v-model="clarificationQuestion" autofocus placeholder="Ask one specific clinical question and include the conflicting or missing fact…" /></label>
        <p class="clarification-help"><AppIcon name="info" :size="14" /> Operations will contact the provider through the practice or facility’s approved channel and attach the response here.</p>
        <button type="button" class="clarification-submit" :disabled="!clarificationQuestion.trim()" @click="submitClarification"><AppIcon name="send" :size="15" /> Route clarification request</button>
      </section>
    </div>

    <div v-if="confirmSend" class="send-modal-backdrop" @click.self="confirmSend = false">
      <section class="send-modal" role="dialog" aria-modal="true" aria-labelledby="send-title">
        <span><AppIcon name="send" :size="20" /></span>
        <h2 id="send-title">Send note to provider?</h2>
        <p>{{ encounter.revision ? `This will return the updated ${encounter.revision.sectionLabel} section to ${encounter.provider || 'the provider'} for final review and signature.` : `This will send the AI-completed, human-supervised encounter to ${encounter.provider || 'Dr. A. Patel'} for final review and signature.` }}</p>
        <div><button type="button" class="button button--secondary" @click="confirmSend = false">Cancel</button><button type="button" class="button button--mint" @click="confirmProviderSend"><AppIcon name="send" :size="14" /> Send to Provider</button></div>
      </section>
    </div>
    <Transition name="toast"><div v-if="toast" class="preview-toast">{{ toast }}</div></Transition>
  </section>
</template>

<style scoped>
.document-preview-page { --clinical-alert: #C34A7D; display: flex; flex: 1; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden; }
.preview-header { align-items: center; background: #fff; border-bottom: 1px solid var(--border); display: flex; flex-shrink: 0; justify-content: space-between; min-height: 50px; padding: 9px 20px; }
.preview-header > div { align-items: center; display: flex; gap: 6px; }
.preview-header > div > span { color: var(--muted); font-size: 11px; }
.preview-header button { background: transparent; border: 0; color: var(--muted); cursor: pointer; font-size: 12px; padding: 0; text-decoration: none; transition: color 120ms; }
.preview-header button:hover { color: #218C69; }
.preview-header strong { color: var(--ink); font-size: 12px; }
.preview-header > span { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; font-size: 11px; font-weight: 700; gap: 5px; padding: 6px 10px; }
.preview-header > span.needs-attention { background: #FFF3E8; color: #A55B13; }
.preview-workspace { display: grid; flex: 1; grid-template-columns: minmax(600px, 1fr) 340px; min-height: 0; overflow: hidden; }
.preview-scroll { background: #F3F3F4; min-width: 0; overflow-y: auto; padding: 24px 32px 70px; }
.review-readiness { align-items: start; background: #fff; border: 1px solid #D9E9E3; border-radius: 8px; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); margin: 0 auto 14px; max-width: 820px; padding: 14px 15px; }
.review-readiness.needs-attention { border-color: #E8C79C; }
.review-readiness > div { align-items: center; display: flex; gap: 9px; }
.review-readiness > div > span { align-items: center; background: var(--green-soft); border-radius: 50%; color: #218C69; display: flex; height: 36px; justify-content: center; width: 36px; }
.review-readiness.needs-attention > div > span { background: #FFF3E8; color: #A55B13; }
.review-readiness p { display: flex; flex-direction: column; gap: 2px; margin: 0; }
.review-readiness p strong { font-size: 13px; }
.review-readiness p small { color: var(--muted); font-size: 9.5px; }
.review-readiness dl { display: grid; gap: 8px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0; width: 100%; }
.review-readiness dl > div { background: #F7F9F8; border-radius: 6px; min-width: 0; padding: 8px 10px; }
.review-readiness dt { color: var(--subtle); font-size: 8px; font-weight: 800; text-transform: uppercase; }
.review-readiness dd { color: var(--ink); font-size: 11px; font-weight: 800; margin: 2px 0 0; white-space: nowrap; }
.clinical-intelligence-card { background: #fff; border: 1px solid #DDD5EC; border-radius: 10px; box-shadow: 0 3px 12px rgba(28,25,46,.055); margin: 0 auto 12px; max-width: 820px; overflow: hidden; }
.clinical-intelligence-card__header { align-items: flex-start; background: linear-gradient(135deg, #F7F3FD, #F4FAF8); display: flex; gap: 24px; justify-content: space-between; padding: 28px 34px 26px; }
.clinical-intelligence-card__header > div { min-width: 0; }
.clinical-intelligence-card__header > div > span { color: var(--purple); font-size: 9px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.clinical-intelligence-card__header h1 { color: var(--ink); font-size: 20px; letter-spacing: -.025em; margin: 6px 0 8px; }
.clinical-intelligence-card__header p { color: var(--muted); font-size: 10.5px; line-height: 16px; margin: 0; max-width: 540px; }
.autonomy-pill { align-items: center; background: var(--green-soft); border: 1px solid #CEE7DE; border-radius: 999px; color: #218C69; display: flex; flex-shrink: 0; font-size: 9.5px; font-weight: 800; gap: 5px; padding: 6px 9px; }
.autonomy-pill.is-attention { background: #FFF3E8; border-color: #E8C79C; color: #A55B13; }
.model-strip { background: #FBFAFD; border: 1px solid #E8E2F1; border-radius: 8px; display: grid; grid-template-columns: minmax(205px, 1.4fr) minmax(125px, .85fr) minmax(155px, 1fr) minmax(135px, .95fr); margin: 22px 34px 6px; overflow: hidden; }
.model-strip > div { min-width: 0; padding: 13px 11px; }
.model-strip > div + div { border-left: 1px solid #EEEAF3; }
.model-strip dt { color: var(--subtle); font-size: 7.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; }
.model-strip dd { color: var(--ink); font-size: 9.5px; font-weight: 750; margin: 3px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clinical-decision-list { display: flex; flex-direction: column; gap: 14px; padding: 18px 34px 28px; }
.clinical-decision { border: 1px solid #E6E3EB; border-radius: 9px; overflow: hidden; padding: 17px 16px 0; }
.clinical-decision.needs-attention { border-color: #E8C79C; box-shadow: inset 3px 0 0 #D58A39; }
.clinical-decision > header { align-items: center; display: flex; gap: 10px; justify-content: space-between; }
.clinical-decision > header > span { color: var(--purple); font-size: 8.5px; font-weight: 850; letter-spacing: .06em; text-transform: uppercase; }
.clinical-decision > header > strong { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; font-size: 9px; gap: 4px; padding: 4px 7px; }
.clinical-decision > header > strong.confidence-medium { background: #FFF8E6; color: #8A6418; }
.clinical-decision > header > strong.confidence-low { background: #FFF0EF; color: #B92D29; }
.clinical-decision h2 { font-size: 14px; letter-spacing: -.01em; margin: 11px 0 6px; }
.clinical-decision > p { color: var(--muted); font-size: 10.5px; line-height: 16px; margin: 0; }
.decision-outputs { display: flex; flex-wrap: wrap; gap: 7px; margin: 13px 0 16px; }
.decision-outputs span { align-items: center; background: #F4FAF8; border: 1px solid #DDEDE7; border-radius: 999px; color: #287A62; display: flex; font-size: 8.5px; font-weight: 750; gap: 3px; padding: 4px 7px; }
.decision-evidence-toggle { align-items: center; background: #FAF9FC; border: 0; border-top: 1px solid #ECE9F0; color: var(--muted); cursor: pointer; display: flex; gap: 14px; justify-content: space-between; margin: 0 -16px; padding: 11px 16px; text-align: left; width: calc(100% + 32px); }
.decision-evidence-toggle > span { align-items: center; display: flex; font-size: 9px; gap: 5px; min-width: 0; }
.decision-evidence-toggle > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.decision-evidence-toggle > span:last-child { color: var(--purple); flex-shrink: 0; font-weight: 800; }
.decision-evidence-list { background: #FBFAFD; display: flex; flex-direction: column; gap: 9px; margin: 0 -16px; padding: 12px 16px 16px; }
.decision-evidence-list article { background: #fff; border: 1px solid #E8E2F1; border-radius: 6px; padding: 9px 10px; }
.decision-evidence-list article header { align-items: center; display: flex; gap: 8px; justify-content: space-between; }
.decision-evidence-list article strong { color: var(--purple-dark); font-size: 10px; }
.decision-evidence-list article header span { color: var(--subtle); font-size: 8.5px; text-align: right; }
.decision-evidence-list article p { color: var(--ink); font-size: 10.5px; line-height: 15px; margin: 6px 0 4px; }
.decision-evidence-list article q { color: var(--muted); display: block; font-size: 9.5px; line-height: 15px; }
.generated-outputs-card { align-items: center; background: #fff; border: 1px solid var(--border); border-radius: 8px; display: flex; gap: 14px; justify-content: space-between; margin: 0 auto 14px; max-width: 820px; padding: 11px 13px; }
.generated-outputs-card > div { align-items: center; display: flex; gap: 9px; min-width: 0; }
.generated-outputs-card > div > span { align-items: center; background: var(--purple-soft); border-radius: 6px; color: var(--purple); display: flex; height: 30px; justify-content: center; width: 30px; }
.generated-outputs-card p { display: flex; flex-direction: column; gap: 2px; margin: 0; min-width: 0; }
.generated-outputs-card p strong { font-size: 10.5px; }
.generated-outputs-card p small { color: var(--muted); font-size: 8.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.generated-outputs-card > button { align-items: center; background: transparent; border: 0; color: var(--purple); cursor: pointer; display: flex; flex-shrink: 0; font-size: 9.5px; font-weight: 800; gap: 4px; padding: 7px; }
.document-paper { background: #fff; border-top: 4px solid #A487D6; border-radius: 8px; box-shadow: 0 2px 8px rgba(28,25,46,.06); margin: 0 auto; max-width: 820px; padding: 28px 34px 40px; }
.document-facility { border-bottom: 1px solid #E8E8EA; display: flex; flex-direction: column; gap: 2px; padding-bottom: 16px; text-align: center; }
.document-facility strong { font-size: 14px; }
.document-facility span { color: var(--muted); font-size: 10px; }
.document-patient { padding: 24px 0 18px; }
.document-patient h1 { color: var(--purple); font-size: 22px; letter-spacing: .01em; margin: 0 0 5px; }
.document-patient p { color: var(--muted); font-size: 11px; margin: 0; }
.document-patient p span { font-weight: 700; }
.document-patient i { font-style: normal; padding: 0 5px; }
.document-title { font-size: 18px; margin: 0 0 14px; }
.document-sections { display: flex; flex-direction: column; gap: 11px; }
.document-section { border: 1px solid #E7E8EB; border-radius: 7px; overflow: hidden; }
.document-section > header { align-items: center; background: #FCFCFD; border-bottom: 1px solid #EEF0F2; display: flex; flex-wrap: wrap; gap: 8px 12px; justify-content: space-between; padding: 10px 13px; }
.document-section h3 { color: #636B78; font-size: 11px; letter-spacing: .035em; margin: 0; text-transform: uppercase; }
.document-section__header-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 7px; justify-content: flex-end; margin-left: auto; }
.document-section__header-actions > span { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; font-size: 10px; font-weight: 700; gap: 4px; padding: 4px 7px; white-space: nowrap; }
.document-section__header-actions > span.confidence-medium { background: #FFF8E6; color: #8A6418; }
.document-section__header-actions > span.confidence-low { background: #FDECEC; color: #B92D29; }
.document-section__header-actions > button { align-items: center; background: #fff; border: 1px solid #D9D2E8; border-radius: 999px; color: var(--purple); cursor: pointer; display: flex; font-size: 10px; font-weight: 750; gap: 4px; min-height: 26px; padding: 4px 9px; white-space: nowrap; }
.document-section__header-actions > button:hover { background: #F7F3FD; }
.document-section__header-actions > button:disabled { color: var(--subtle); cursor: not-allowed; }
.document-body { color: #252335; font-size: 13px; line-height: 1.58; padding: 13px 15px; }
.document-body p { margin: 0 0 7px; }
.document-body p:last-child { margin-bottom: 0; }
.document-body ul { margin: 0; padding-left: 18px; }
.document-body li + li { margin-top: 3px; }
.inline-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
.inline-tags span { background: #F3F4F6; border-radius: 999px; color: var(--muted); font-size: 9px; padding: 3px 7px; }
.document-subgrid { background: #F8F9FA; display: grid; gap: 8px 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 10px; padding: 10px; }
.document-subgrid > span { display: flex; flex-direction: column; font-size: 11px; }
.document-subgrid strong { color: var(--subtle); font-size: 8px; letter-spacing: .04em; text-transform: uppercase; }
.two-column-list { display: grid; gap: 8px 20px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.two-column-list > div { display: flex; flex-direction: column; gap: 1px; }
.two-column-list strong { font-size: 11px; }
.two-column-list span { color: var(--muted); font-size: 12px; }
.full-width-note { grid-column: 1 / -1; }
.vitals-document-grid { display: grid; gap: 8px 18px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.vitals-document-grid div { display: flex; flex-direction: column; }
.vitals-document-grid strong { color: var(--muted); font-size: 9px; }
.vitals-document-grid span { font-size: 12px; font-weight: 700; }
.vitals-document-grid .abnormal span { color: var(--clinical-alert); }
.vitals-document-grid > p { grid-column: 1 / -1; }
.vitals-meta { background: #F8F9FA; font-size: 10px; padding: 7px 9px; }
.table-wrap { overflow-x: auto; }
.document-body table { border-collapse: collapse; width: 100%; }
.document-body th { background: #F8F9FA; color: var(--subtle); font-size: 9.5px; letter-spacing: .04em; padding: 8px 9px; text-align: left; text-transform: uppercase; }
.document-body td { border-top: 1px solid #EEEEEE; font-size: 11.5px; line-height: 1.5; padding: 9px; vertical-align: top; }
.document-body td:first-child { font-weight: 700; width: 30%; }
.document-note { background: #FFF8E6; border-radius: 5px; color: #805B13; font-size: 10px; margin-top: 8px !important; padding: 7px 9px; }
.document-note--neutral { background: #F5F6F7; color: var(--muted); }
.document-body table small { color: var(--muted); font-size: 9px; font-weight: 400; }
.visit-note-document > span { align-items: center; color: #147D6B; display: flex; font-size: 9px; font-weight: 800; gap: 4px; letter-spacing: .035em; margin-bottom: 7px; text-transform: uppercase; }
.visit-note-document > p { white-space: pre-wrap; }
.allergies-preview-list > li { margin-bottom: 0; }
.allergies-preview-list ul { margin-top: 5px; }
.allergies-reported-label, .allergy-critical { color: var(--clinical-alert); }
.ros-question { margin-bottom: 5px !important; }
.ros-source-answer { font-style: italic; margin-bottom: 12px !important; }
.ros-subheading { margin: 12px 0 5px !important; }
.ros-document { margin-bottom: 10px !important; padding-left: 18px !important; }
.ros-document > li { margin-bottom: 9px; }
.ros-document > li > strong { font-weight: 800; }
.ros-document > li > ul { margin-top: 3px; padding-left: 20px; }
.ros-reported, .ros-reported b { color: var(--clinical-alert); }
.pe-document { display: block; }
.pe-heading { margin-bottom: 6px !important; }
.pe-categories { padding-left: 18px !important; }
.pe-category { margin-bottom: 14px !important; }
.pe-category > strong { font-weight: 800; }
.pe-category > ul { margin-top: 3px; padding-left: 20px; }
.pe-abnormal, .pe-abnormal b, .pe-abnormal strong { color: var(--clinical-alert); }
.diagnostic-line { align-items: baseline; display: flex; gap: 8px; margin-bottom: 5px; }
.diagnostic-line strong { font-size: 11px; }
.diagnostic-line span { color: var(--muted); font-size: 10px; }
.assessment-document { display: flex; flex-direction: column; gap: 9px; }
.assessment-document article { border: 1px solid #EEF0F2; border-radius: 5px; padding: 9px 10px; }
.assessment-document article header { align-items: center; display: flex; justify-content: space-between; }
.assessment-document article header span { color: var(--green); font-size: 9px; font-weight: 700; }
.assessment-document article p { font-size: 10.5px; margin-top: 5px; }
.assessment-document .mdm { background: #F7F3FD; border-radius: 5px; padding: 8px 10px; }
.screening-document { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.screening-document article { border: 1px solid #EEF0F2; border-radius: 5px; padding: 9px 10px; }
.screening-document article header { align-items: center; display: flex; gap: 8px; justify-content: space-between; }
.screening-document article header strong { font-size: 10px; }
.screening-document article header span { color: #218C69; font-size: 8px; font-weight: 800; }
.screening-document article p { font-size: 10px; margin: 4px 0 0; }
.screening-document article p.screening-high-risk { color: var(--clinical-alert); font-weight: 700; }
.screening-document article small { color: var(--muted); display: block; font-size: 9px; line-height: 14px; margin-top: 3px; }
.section-evidence-toggle { align-items: center; background: #EEE9F5; border: 0; border-top: 1px solid #D8CEE5; color: #62517F; cursor: pointer; display: flex; gap: 12px; justify-content: space-between; padding: 9px 13px; text-align: left; transition: background 140ms; width: 100%; }
.section-evidence-toggle:hover { background: #E8E1F1; }
.section-evidence-toggle:focus-visible { box-shadow: inset 0 0 0 3px rgba(103,86,140,.22); outline: 0; }
.section-evidence-toggle > span { align-items: center; display: flex; gap: 5px; min-width: 0; }
.section-evidence-toggle b { color: #4E3D68; font-size: 9.5px; }
.section-evidence-toggle small { color: #746889; font-size: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.section-evidence-toggle > span:last-child { color: #594573; flex-shrink: 0; font-size: 9px; font-weight: 700; }
.section-evidence-list { background: #FBFAFD; border-top: 1px solid #DED6E8; display: flex; flex-direction: column; gap: 7px; padding: 10px 13px 13px; }
.section-evidence-list article { background: #fff; border: 1px solid #E8E2F1; border-radius: 6px; padding: 9px 10px; }
.section-evidence-list article header { align-items: center; display: flex; gap: 8px; justify-content: space-between; }
.section-evidence-list article strong { color: var(--purple-dark); font-size: 10px; }
.section-evidence-list article header span { color: var(--subtle); font-size: 8.5px; text-align: right; }
.section-evidence-list article p { color: var(--ink); font-size: 10.5px; line-height: 15px; margin: 6px 0 4px; }
.section-evidence-list article q { color: var(--muted); display: block; font-size: 9.5px; line-height: 15px; }
.evidence-reveal-enter-active, .evidence-reveal-leave-active { transition: opacity 140ms, transform 140ms; }
.evidence-reveal-enter-from, .evidence-reveal-leave-to { opacity: 0; transform: translateY(-4px); }
.preview-sidebar { background: #fff; border-left: 1px solid var(--border); display: flex; flex-direction: column; min-height: 0; }
.preview-sidebar__scroll { flex: 1; overflow-y: auto; padding: 18px; }
.preview-sidebar__scroll > header > span { color: var(--subtle); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.preview-sidebar__scroll > header h2 { color: var(--purple); font-size: 17px; margin: 4px 0 2px; }
.preview-sidebar__scroll > header p { color: var(--muted); font-size: 11px; margin: 0 0 14px; }
.sidebar-edit { align-items: center; background: #fff; border: 1px solid var(--mint); border-radius: 5px; color: #139B80; cursor: pointer; display: flex; font-size: 11px; font-weight: 700; gap: 6px; justify-content: center; min-height: 36px; width: 100%; }
.sidebar-card { border-top: 1px solid #EEF0F2; margin-top: 17px; padding-top: 16px; }
.sidebar-card__title { align-items: center; display: flex; justify-content: space-between; }
.sidebar-card h3 { font-size: 13px; margin: 0; }
.sidebar-card__title > small { color: var(--subtle); font-size: 8px; }
.ready-pill { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; font-size: 9px; font-weight: 700; gap: 3px; padding: 4px 7px; }
.ready-pill.blocked { background: #FFF3E8; color: #A55B13; }
.review-checks-intro { color: var(--muted); font-size: 10px; line-height: 15px; margin: 8px 0 10px; }
.review-check-list { display: flex; flex-direction: column; gap: 7px; }
.review-check-list article { align-items: flex-start; background: #FFF8F1; border: 1px solid #E8C79C; border-radius: 7px; display: grid; gap: 8px; grid-template-columns: 24px minmax(0, 1fr); padding: 9px; }
.review-check-list article.resolved { background: #F5FAF8; border-color: #D5EAE3; }
.review-check-list article > span { align-items: center; background: #fff; border-radius: 50%; color: #A55B13; display: flex; height: 24px; justify-content: center; width: 24px; }
.review-check-list article.resolved > span { color: #218C69; }
.review-check-list article > div { min-width: 0; }
.review-check-list article strong { display: block; font-size: 10.5px; }
.review-check-list article small { color: #A55B13; display: block; font-size: 8.5px; font-weight: 700; margin-top: 2px; }
.review-check-list article p { color: var(--muted); font-size: 9.5px; line-height: 14px; margin: 5px 0; }
.review-check-list article em { color: var(--subtle); display: block; font-size: 8.5px; font-style: normal; }
.review-check-list article > button { align-items: center; background: #fff; border: 1px solid #D9C0A2; border-radius: 5px; color: #945314; cursor: pointer; display: flex; font-size: 9px; font-weight: 800; gap: 3px; grid-column: 2; justify-self: start; padding: 5px 7px; }
.sidebar-more { border-top: 1px solid #EEF0F2; margin-top: 17px; padding-top: 16px; }
.sidebar-more > summary { align-items: center; background: #F8F7FB; border: 1px solid #E5E0EC; border-radius: 7px; color: var(--purple-dark); cursor: pointer; display: flex; justify-content: space-between; list-style: none; padding: 11px 12px; }
.sidebar-more > summary::-webkit-details-marker { display: none; }
.sidebar-more > summary > span { align-items: center; display: flex; gap: 7px; }
.sidebar-more > summary b { font-size: 12.5px; }
.sidebar-more > summary > svg { transition: transform 140ms; }
.sidebar-more[open] > summary > svg { transform: rotate(180deg); }
.sidebar-more__content > .sidebar-card:first-child { margin-top: 12px; }
.qa-metrics { display: grid; gap: 6px; grid-template-columns: repeat(3, 1fr); margin: 10px 0; }
.qa-metrics span { background: #F8F9FA; border-radius: 6px; display: flex; flex-direction: column; padding: 8px; }
.qa-metrics strong { font-size: 16px; }
.qa-metrics small { color: var(--muted); font-size: 9px; }
.qa-summary-card > p { align-items: flex-start; color: #218C69; display: flex; font-size: 10px; gap: 5px; line-height: 15px; margin: 0; }
.agent-trace-list { display: flex; flex-direction: column; gap: 5px; }
.agent-trace-list details { border: 1px solid #EEF0F2; border-radius: 6px; overflow: hidden; }
.agent-trace-list summary { align-items: center; cursor: pointer; display: grid; gap: 6px; grid-template-columns: 22px minmax(0, 1fr) auto 11px; list-style: none; padding: 7px; }
.agent-trace-list summary::-webkit-details-marker { display: none; }
.agent-trace-list summary > span { align-items: center; background: var(--purple-soft); border-radius: 5px; color: var(--purple); display: flex; height: 22px; justify-content: center; width: 22px; }
.agent-trace-list summary b { font-size: 9.5px; min-width: 0; }
.agent-trace-list summary em { color: var(--subtle); font-size: 8px; font-style: normal; white-space: nowrap; }
.agent-trace-list details[open] summary > svg { transform: rotate(180deg); }
.agent-trace-list details > p { background: #FAF9FC; color: var(--muted); font-size: 9px; line-height: 14px; margin: 0; padding: 7px 9px 9px 35px; }
.learning-card > p { background: #F4FAF8; border: 1px solid #DDEDE7; border-radius: 7px; color: #287A62; font-size: 9.5px; line-height: 15px; margin: 9px 0 0; padding: 9px; }
.learning-feedback-list { display: flex; flex-direction: column; gap: 6px; margin-top: 9px; }
.learning-feedback-list article { background: #F7F9F8; border-radius: 6px; display: flex; flex-direction: column; gap: 2px; padding: 8px; }
.learning-feedback-list strong { font-size: 9.5px; }
.learning-feedback-list span { color: var(--muted); font-size: 9px; line-height: 13px; }
.learning-feedback-list small { color: var(--subtle); font-size: 7.5px; }
.preview-sources { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.preview-sources > span { align-items: center; border: 1px solid #EEF1F4; border-radius: 7px; display: flex; gap: 8px; padding: 8px; }
.preview-sources i { align-items: center; border-radius: 5px; display: flex; height: 26px; justify-content: center; width: 26px; }
.preview-sources i.purple { background: var(--purple-soft); color: var(--purple); }
.preview-sources i.blue { background: #E6F3FB; color: #0076A8; }
.preview-sources i.green { background: var(--green-soft); color: #218C69; }
.preview-sources i.gold { background: #FFF8E6; color: #9A6912; }
.preview-sources i.teal { background: #E3F6F1; color: #147D6B; }
.preview-sources b { flex: 1; font-size: 11px; }
.preview-sources em { color: var(--subtle); font-size: 9px; font-style: normal; }
.preview-sidebar footer { border-top: 1px solid var(--border); padding: 14px 18px; }
.preview-sidebar footer > span { align-items: center; color: #218C69; display: flex; font-size: 10px; font-weight: 700; gap: 5px; margin-bottom: 8px; }
.preview-sidebar footer > span.blocked { color: #A55B13; }
.preview-sidebar footer .button { min-height: 42px; width: 100%; }
.sent-status { color: var(--purple-dark) !important; }
.clarification-scrim { align-items: flex-end; background: rgba(28,25,46,.42); display: flex; inset: 0; justify-content: center; padding: 10px; position: fixed; z-index: 130; }
.clarification-sheet { background: #fff; border-radius: 18px 18px 12px 12px; box-shadow: 0 18px 50px rgba(28,25,46,.2); max-height: calc(100vh - 20px); max-width: 560px; overflow-y: auto; padding: 8px 18px 20px; width: 100%; }
.clarification-sheet__handle { background: #D8DAE1; border-radius: 99px; height: 4px; margin: 0 auto 8px; width: 40px; }
.clarification-sheet > header { align-items: center; display: flex; gap: 12px; justify-content: space-between; }
.clarification-sheet > header h2 { font-size: 21px; line-height: 28px; margin: 0; }
.clarification-sheet > header button { align-items: center; background: #F5F5F8; border: 0; border-radius: 50%; color: var(--ink); cursor: pointer; display: flex; flex: 0 0 40px; height: 40px; justify-content: center; padding: 0; width: 40px; }
.clarification-summary { background: #F7F7FA; border-radius: 8px; color: var(--muted); font-size: 13px; line-height: 19px; margin: 12px 0 0; padding: 12px; }
.clarification-route { align-items: flex-start; background: #FBF9FF; border: 1px solid #DED6F7; border-radius: 10px; display: grid; gap: 10px; grid-template-columns: 34px minmax(0, 1fr); margin-top: 12px; padding: 12px; }
.clarification-route > span { align-items: center; background: var(--purple-soft); border-radius: 8px; color: var(--purple); display: flex; height: 34px; justify-content: center; width: 34px; }
.clarification-route > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.clarification-route small { color: var(--purple); font-size: 11px; font-weight: 850; letter-spacing: .045em; text-transform: uppercase; }
.clarification-route strong { color: var(--ink); font-size: 13px; line-height: 18px; }
.clarification-route p { color: var(--muted); font-size: 12px; line-height: 17px; margin: 2px 0 0; }
.clarification-field { color: var(--ink); display: grid; font-size: 12px; font-weight: 750; gap: 7px; margin-top: 16px; }
.clarification-field textarea { background: #fff; border: 1px solid #D9DCE5; border-radius: 9px; color: var(--ink); font: inherit; font-size: 14px; font-weight: 500; line-height: 1.45; min-height: 148px; padding: 11px 12px; resize: vertical; width: 100%; }
.clarification-field textarea:focus { border-color: #A98DDA; box-shadow: 0 0 0 3px rgba(103,86,140,.1); outline: 0; }
.clarification-help { align-items: flex-start; color: var(--muted); display: flex; font-size: 12px; gap: 7px; line-height: 17px; margin: 10px 0 0; }
.clarification-help svg { color: var(--purple); margin-top: 1px; }
.clarification-submit { align-items: center; background: var(--purple); border: 1px solid var(--purple); border-radius: 10px; color: #fff; cursor: pointer; display: flex; font-size: 13px; font-weight: 750; gap: 8px; justify-content: center; margin-top: 16px; min-height: 50px; padding: 10px 16px; width: 100%; }
.clarification-submit:disabled { cursor: not-allowed; opacity: .46; }
.send-modal-backdrop { align-items: center; background: rgba(28,25,46,.42); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 100; }
.send-modal { background: #fff; border-radius: 12px; box-shadow: 0 18px 50px rgba(28,25,46,.2); max-width: 420px; padding: 26px; text-align: center; width: 100%; }
.send-modal > span { align-items: center; background: var(--green-soft); border-radius: 50%; color: var(--green); display: flex; height: 48px; justify-content: center; margin: 0 auto 12px; width: 48px; }
.send-modal h2 { font-size: 19px; margin-bottom: 7px; }
.send-modal p { color: var(--muted); font-size: 12px; line-height: 19px; margin-bottom: 18px; }
.send-modal > div { display: flex; gap: 8px; justify-content: center; }
.preview-toast { background: var(--ink); border-radius: 7px; bottom: 22px; color: #fff; font-size: 11px; font-weight: 700; left: 50%; padding: 10px 14px; position: fixed; transform: translateX(-50%); z-index: 120; }
.toast-enter-active, .toast-leave-active { transition: opacity 150ms; }
.toast-enter-from, .toast-leave-to { opacity: 0; }

/* Readability baseline: clinical review text should remain legible without browser zoom. */
.preview-header > div > span, .preview-header > span { font-size: 12px; }
.preview-header button, .preview-header strong { font-size: 13px; }
.review-readiness p strong { font-size: 15px; }
.review-readiness p small { font-size: 12.5px; line-height: 18px; }
.review-readiness dt { font-size: 12px; }
.review-readiness dd { font-size: 13px; }
.clinical-intelligence-card__header > div > span { font-size: 12px; }
.clinical-intelligence-card__header h1 { font-size: 22px; line-height: 28px; }
.clinical-intelligence-card__header p { font-size: 13px; line-height: 19px; }
.autonomy-pill { font-size: 12px; }
.model-strip dt { font-size: 12px; }
.model-strip dd { font-size: 12px; line-height: 17px; }
.clinical-decision > header > span { font-size: 12px; }
.clinical-decision > header > strong { font-size: 12px; }
.clinical-decision h2 { font-size: 16px; line-height: 22px; }
.clinical-decision > p { font-size: 13px; line-height: 19px; }
.decision-outputs span { font-size: 12px; padding: 5px 8px; white-space: nowrap; }
.decision-evidence-toggle > span { font-size: 12px; line-height: 18px; }
.decision-evidence-list article strong, .section-evidence-list article strong { font-size: 12px; }
.decision-evidence-list article header span, .section-evidence-list article header span { font-size: 12px; }
.decision-evidence-list article p, .section-evidence-list article p { font-size: 12.5px; line-height: 18px; }
.decision-evidence-list article q, .section-evidence-list article q { font-size: 12px; line-height: 18px; }
.generated-outputs-card p strong { font-size: 13px; }
.generated-outputs-card p small { font-size: 12px; line-height: 18px; }
.generated-outputs-card > button { font-size: 12px; }
.document-facility span { font-size: 12px; }
.document-patient p { font-size: 13px; }
.document-section h3 { font-size: 13px; }
.document-section > header > span { font-size: 12px; }
.document-body { font-size: 13.5px; line-height: 1.65; }
.inline-tags span { font-size: 12px; }
.document-subgrid > span, .two-column-list span { font-size: 12.5px; }
.document-subgrid strong, .vitals-document-grid strong { font-size: 12px; }
.two-column-list strong { font-size: 12.5px; }
.vitals-document-grid span { font-size: 13px; }
.vitals-meta { font-size: 12px; }
.document-body th { font-size: 12px; }
.document-body td { font-size: 12.5px; }
.document-note, .document-body table small { font-size: 12px; }
.visit-note-document > span { font-size: 12px; }
.pe-document section > strong, .ros-document section > strong { font-size: 12px; }
.pe-document section ul, .pe-devices p, .ros-document section p { font-size: 12px; line-height: 18px; }
.pe-devices small { font-size: 12px; }
.diagnostic-line strong { font-size: 12.5px; }
.diagnostic-line span { font-size: 12px; }
.assessment-document article header span { font-size: 12px; }
.assessment-document article p { font-size: 12.5px; line-height: 18px; }
.screening-document article header strong { font-size: 12px; }
.screening-document article header span { font-size: 12px; }
.screening-document article p { font-size: 12px; }
.screening-document article small { font-size: 12px; line-height: 18px; }
.section-evidence-toggle b, .section-evidence-toggle small, .section-evidence-toggle > span:last-child { font-size: 12px; }
.preview-sidebar__scroll > header > span { font-size: 12px; }
.preview-sidebar__scroll > header p { font-size: 12.5px; line-height: 18px; }
.sidebar-edit { font-size: 12.5px; min-height: 40px; }
.sidebar-card h3 { font-size: 15px; }
.sidebar-card__title > small { font-size: 12px; }
.ready-pill { font-size: 12px; }
.review-checks-intro { font-size: 12px; line-height: 18px; }
.review-check-list article strong { font-size: 12px; line-height: 17px; }
.review-check-list article small, .review-check-list article em { font-size: 12px; line-height: 17px; }
.review-check-list article p { font-size: 12px; line-height: 18px; }
.review-check-list article > button { font-size: 12px; }
.qa-metrics small, .qa-summary-card > p { font-size: 12px; line-height: 18px; }
.agent-trace-list summary b { font-size: 12px; }
.agent-trace-list summary em { font-size: 12px; }
.agent-trace-list details > p { font-size: 12px; line-height: 18px; }
.learning-card > p { font-size: 12px; line-height: 18px; }
.learning-feedback-list strong { font-size: 12px; }
.learning-feedback-list span { font-size: 12px; line-height: 17px; }
.learning-feedback-list small { font-size: 12px; }
.preview-sources b { font-size: 12px; }
.preview-sources em { font-size: 12px; }
.preview-sidebar footer > span { font-size: 12px; line-height: 17px; }
.send-modal p { font-size: 13px; line-height: 20px; }
.preview-toast { font-size: 12px; }

@media (max-width: 1100px) {
  .preview-workspace { grid-template-columns: minmax(0, 1fr); overflow-y: auto; }
  .preview-scroll { overflow: visible; }
  .preview-sidebar { border-left: 0; border-top: 1px solid var(--border); }
  .preview-sidebar__scroll { overflow: visible; }
}
@media (max-width: 700px) {
  .preview-header { align-items: flex-start; flex-direction: column; gap: 8px; }
  .preview-header > span { align-self: stretch; justify-content: center; }
  .preview-scroll { padding: 14px 10px 92px; }
  .document-paper { border-radius: 5px; padding: 20px 14px 28px; }
  .document-patient h1 { font-size: 18px; }
  .document-body { font-size: 13.5px; padding: 10px; }
  .review-readiness dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
  .clinical-intelligence-card__header { flex-direction: column; gap: 10px; padding: 15px; }
  .clinical-intelligence-card__header h1 { font-size: 18px; }
  .model-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 14px 10px 4px; }
  .model-strip dt { white-space: normal; }
  .model-strip > div:nth-child(3) { border-left: 0; border-top: 1px solid #EEEAF3; }
  .model-strip > div:nth-child(4) { border-top: 1px solid #EEEAF3; }
  .clinical-decision-list { padding: 10px; }
  .clinical-decision { padding: 11px 11px 0; }
  .decision-evidence-toggle { margin-left: -11px; margin-right: -11px; width: calc(100% + 22px); }
  .decision-evidence-toggle > span:first-child { white-space: normal; }
  .decision-evidence-list { margin-left: -11px; margin-right: -11px; }
  .generated-outputs-card { align-items: stretch; flex-direction: column; gap: 6px; }
  .generated-outputs-card > button { justify-content: center; }
  .two-column-list, .vitals-document-grid, .pe-document, .document-subgrid, .ros-document, .screening-document { grid-template-columns: 1fr; }
  .vitals-document-grid > p, .pe-document > p { grid-column: auto; }
  .preview-sidebar__scroll { padding: 14px; }
  .preview-sidebar footer { align-items: center; background: #fff; bottom: 0; box-shadow: 0 -5px 18px rgba(28,25,46,.08); display: flex; gap: 10px; left: 0; padding: 10px 12px max(10px, env(safe-area-inset-bottom)); position: fixed; right: 0; z-index: 80; }
  .preview-sidebar footer > span { display: none; }
  .preview-sidebar footer .button { min-height: 46px; }
  .send-modal > div { flex-direction: column; }
}
</style>
