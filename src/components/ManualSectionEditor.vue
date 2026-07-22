<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import {
  cancerSubtypeOptions,
  codeStatusOptions,
  cptCatalog,
  editorSections,
  familyConditionOptions,
  immunizationOptions,
  peDeviceGroups,
  physicalExamGroups,
  pmhConditionGroups,
  rosGroups,
  socialHistoryGroups,
} from '../data/editorData'

const props = defineProps({
  sectionId: { type: String, required: true },
  modelValue: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true },
})

const emit = defineEmits(['save', 'cancel'])
const draft = ref(clone(props.modelValue))
const newValue = ref('')
const savedPulse = ref(false)
const openRosGroups = ref(rosGroups.map((group) => group.name))
const rosNoteEditing = ref('')

const section = computed(() => editorSections.find((item) => item.id === props.sectionId) || editorSections[0])

watch(() => [props.sectionId, props.modelValue], () => {
  draft.value = clone(props.modelValue)
  newValue.value = ''
  openRosGroups.value = rosGroups.map((group) => group.name)
  rosNoteEditing.value = ''
}, { deep: true })

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}))
}

function toggleArray(list, value) {
  const index = list.indexOf(value)
  if (index >= 0) list.splice(index, 1)
  else list.push(value)
}

function addPmh() {
  const value = (draft.value.search || '').trim()
  if (!value || draft.value.problems.includes(value)) return
  draft.value.problems.push(value)
  draft.value.search = ''
}

function addSurgery() {
  const value = (draft.value.search || '').trim()
  if (!value || draft.value.surgeries.includes(value)) return
  draft.value.surgeries.push(value)
  draft.value.search = ''
  draft.value.noPrior = false
}

function addRelative() {
  draft.value.relatives.push({ relationship: '', conditions: [], cancerSubtype: '', ageOfOnset: '', deceased: 'No', age: '', contributory: false, notes: '' })
}

function addVaccine() {
  draft.value.vaccines.push({ name: '', date: '' })
}

function toggleVaccine(name) {
  const index = draft.value.vaccines.findIndex((item) => item.name === name)
  if (index >= 0) draft.value.vaccines.splice(index, 1)
  else draft.value.vaccines.push({ name, date: '' })
}

function addAllergy() {
  draft.value.items.push({ allergen: '', category: 'Medication', type: 'Allergy', reaction: '', reactionSubType: '', severity: 'Unknown', status: 'Active', onsetDate: '', notes: '' })
  draft.value.historyType = 'Reported allergies'
}

function addMedication() {
  draft.value.items.push({ name: '', form: '', strength: '', direction: '', route: 'Oral', frequency: '', quantity: '', unit: '', refills: '', useGeneric: true, startDate: '', revisionDate: '', autoComplete: false, type: 'Active', status: 'Active', pharmacyNotes: '' })
}

function rosSymptomKey(groupName, symptom) {
  return `${groupName}:${symptom}`
}

function isRosGroupOpen(groupName) {
  return openRosGroups.value.includes(groupName)
}

function toggleRosGroup(groupName) {
  openRosGroups.value = isRosGroupOpen(groupName)
    ? openRosGroups.value.filter((name) => name !== groupName)
    : [...openRosGroups.value, groupName]
}

function clearRosSymptoms() {
  draft.value.findings = Object.fromEntries(rosGroups.map((group) => [group.name, Object.fromEntries(group.symptoms.map((symptom) => [symptom, 'unset']))]))
  draft.value.notesBySymptom = Object.fromEntries(rosGroups.flatMap((group) => group.symptoms.map((symptom) => [rosSymptomKey(group.name, symptom), ''])))
  draft.value.deniesAll = false
  rosNoteEditing.value = ''
}

function setRosSource(source) {
  draft.value.source = source
  if (source !== 'Unable to obtain') {
    draft.value.unableReason = ''
    draft.value.unableReasonDetail = ''
  }
  if (source !== 'From staff / caregiver') draft.value.otherSources = []
  if (source === 'Unable to obtain') clearRosSymptoms()
}

function clearRosSource() {
  draft.value.source = ''
  draft.value.unableReason = ''
  draft.value.unableReasonDetail = ''
  draft.value.otherSources = []
  clearRosSymptoms()
}

function allRosNegative() {
  return rosGroups.every((group) => group.symptoms.every((symptom) => draft.value.findings[group.name]?.[symptom] === 'negative'))
}

function rosGroupAllNegative(group) {
  return group.symptoms.every((symptom) => draft.value.findings[group.name]?.[symptom] === 'negative')
}

function setRosState(groupName, symptom, state) {
  if (!draft.value.findings[groupName]) draft.value.findings[groupName] = {}
  if (!draft.value.notesBySymptom) draft.value.notesBySymptom = {}
  const nextState = draft.value.findings[groupName][symptom] === state ? 'unset' : state
  draft.value.findings[groupName][symptom] = nextState
  draft.value.notesBySymptom[rosSymptomKey(groupName, symptom)] = ''
  if (nextState === 'unset') rosNoteEditing.value = ''
  draft.value.deniesAll = allRosNegative()
}

function toggleDeniesAll() {
  const nextState = allRosNegative() ? 'unset' : 'negative'
  draft.value.findings = Object.fromEntries(rosGroups.map((group) => [group.name, Object.fromEntries(group.symptoms.map((symptom) => [symptom, nextState]))]))
  draft.value.notesBySymptom = Object.fromEntries(rosGroups.flatMap((group) => group.symptoms.map((symptom) => [rosSymptomKey(group.name, symptom), ''])))
  draft.value.deniesAll = nextState === 'negative'
  rosNoteEditing.value = ''
}

function toggleRosGroupDenies(group) {
  const nextState = rosGroupAllNegative(group) ? 'unset' : 'negative'
  if (!draft.value.findings[group.name]) draft.value.findings[group.name] = {}
  if (!draft.value.notesBySymptom) draft.value.notesBySymptom = {}
  group.symptoms.forEach((symptom) => {
    draft.value.findings[group.name][symptom] = nextState
    draft.value.notesBySymptom[rosSymptomKey(group.name, symptom)] = ''
  })
  draft.value.deniesAll = allRosNegative()
  rosNoteEditing.value = ''
}

function toggleRosNote(groupName, symptom) {
  const key = rosSymptomKey(groupName, symptom)
  rosNoteEditing.value = rosNoteEditing.value === key ? '' : key
}

function addProblem() {
  draft.value.problems.push({ diagnosis: '', code: '', status: '', assessment: '', plan: '', treatments: [], action: '', responsibleParty: '', timing: '', followUp: '' })
}

function addCpt() {
  const value = (draft.value.search || '').trim()
  if (!value) return
  const match = value.match(/^(\d{5})\s*[-–:]?\s*(.*)$/)
  draft.value.codes.push({ code: match?.[1] || value, description: match?.[2] || 'Custom CPT code', modifiers: '' })
  draft.value.search = ''
}

function toggleCptOption([code, description]) {
  const index = draft.value.codes.findIndex((item) => item.code === code)
  if (index >= 0) draft.value.codes.splice(index, 1)
  else draft.value.codes.push({ code, description, modifiers: '' })
}

function setAllPeNormal() {
  draft.value.groups = physicalExamGroups.map((group) => {
    const nextGroup = clone(group)
    nextGroup.notes = ''
    nextGroup.findings.forEach((finding) => {
      if (finding.inputType === 'select') {
        finding.value = finding.normalOptions?.[0] || finding.options?.[0] || ''
      } else {
        finding.state = finding.polarity === 'normal_when_present' ? 'positive' : 'negative'
        finding.value = peToggleLabels(finding)[finding.state]
      }
      clearPeExtras(finding)
    })
    return nextGroup
  })
}

function peToggleLabels(finding) {
  const labels = {
    'yes-no': { positive: 'Yes', negative: 'No' },
    'normal-abnormal': { positive: 'Normal', negative: 'Abnormal' },
    'alert-not-alert': { positive: 'Alert', negative: 'Not Alert' },
    'awake-not-awake': { positive: 'Awake', negative: 'Not Awake' },
    'intact-not-intact': { positive: 'Intact', negative: 'Not Intact' },
    'equal-not-equal': { positive: 'Equal', negative: 'Not equal' },
    'increase-decrease': { positive: 'Increased', negative: 'Decreased' },
    'normal-amputated': { positive: 'Normal', negative: 'Amputated' },
    'regular-irregular': { positive: 'Regular', negative: 'Irregular' },
  }
  return labels[finding.toggleStyle] || { positive: 'Present', negative: 'Absent' }
}

function peNormality(finding) {
  if (finding.inputType === 'select') {
    if (!finding.value) return 'unset'
    return finding.normalOptions?.includes(finding.value) ? 'normal' : 'abnormal'
  }
  if (!finding.state || finding.state === 'unset') return 'unset'
  if (finding.polarity === 'normal_when_present') return finding.state === 'positive' ? 'normal' : 'abnormal'
  return finding.state === 'positive' ? 'abnormal' : 'normal'
}

function isPeAbnormal(finding) {
  return peNormality(finding) === 'abnormal'
}

function matchesPeCondition(finding, condition) {
  if (!condition) return true
  if (condition === 'positive' || condition === 'negative') return finding.state === condition
  if (condition === 'normal' || condition === 'abnormal') return peNormality(finding) === condition
  if (condition === 'answered') return finding.inputType === 'select' ? Boolean(finding.value) : finding.state !== 'unset'
  if (condition === 'other') return finding.value === 'Other'
  return false
}

function showPeChildren(finding) {
  if (!finding.detailOptions?.length && !finding.childGroups?.length) return false
  if (finding.childrenForSelections?.length) return finding.childrenForSelections.includes(finding.value)
  return matchesPeCondition(finding, finding.childrenShowWhen)
}

function showPeDetails(finding) {
  return Boolean(finding.detailPlaceholder) && matchesPeCondition(finding, finding.detailShowWhen)
}

function showPeLaterality(finding) {
  return finding.lateralityEnabled && matchesPeCondition(finding, finding.lateralityShowWhen)
}

function clearPeExtras(finding) {
  finding.detail = ''
  finding.laterality = ''
  finding.selectedDetails = []
  finding.detailStates = Object.fromEntries((finding.detailOptions || []).map((item) => [item, 'unset']))
  finding.childSelections = Object.fromEntries((finding.childGroups || []).map((group) => [group.name, group.type === 'chips' ? [] : '']))
}

function clearHiddenPeExtras(finding) {
  if (!showPeChildren(finding)) {
    finding.selectedDetails = []
    finding.detailStates = Object.fromEntries((finding.detailOptions || []).map((item) => [item, 'unset']))
    finding.childSelections = Object.fromEntries((finding.childGroups || []).map((group) => [group.name, group.type === 'chips' ? [] : '']))
  }
  if (!showPeDetails(finding)) finding.detail = ''
  if (!showPeLaterality(finding)) finding.laterality = ''
}

function setPeToggle(finding, state) {
  finding.state = finding.state === state ? 'unset' : state
  finding.value = finding.state === 'unset' ? 'Unset' : peToggleLabels(finding)[finding.state]
  clearHiddenPeExtras(finding)
}

function selectPeOption(finding, value) {
  finding.value = value
  clearHiddenPeExtras(finding)
}

function setPeChildState(finding, detail, state) {
  if (!finding.detailStates) finding.detailStates = {}
  finding.detailStates[detail] = finding.detailStates[detail] === state ? 'unset' : state
  finding.selectedDetails = Object.entries(finding.detailStates).filter(([, value]) => value === 'positive').map(([name]) => name)
}

function childStateIsAbnormal(finding, detail, state) {
  if (state === 'unset') return false
  const normalWhenPresentChild = finding.normalChildren?.includes(detail)
  return normalWhenPresentChild ? state === 'negative' : state === 'positive'
}

function setSinglePeDetail(finding, value) {
  finding.selectedDetails = value ? [value] : []
}

function jointDetailGroups(finding) {
  const groups = new Map()
  finding.detailOptions?.forEach((item) => {
    const [part, kind] = item.split(' — ')
    if (!groups.has(part)) groups.set(part, [])
    groups.get(part).push({ value: item, label: kind === 'pain' ? 'In Pain' : 'Swelling' })
  })
  return Array.from(groups, ([name, options]) => ({ name, options }))
}

function toggleJointDetail(finding, value) {
  toggleArray(finding.selectedDetails, value)
}

function togglePeChildChip(finding, groupName, option) {
  if (!finding.childSelections) finding.childSelections = {}
  if (!Array.isArray(finding.childSelections[groupName])) finding.childSelections[groupName] = []
  toggleArray(finding.childSelections[groupName], option)
}

function setPeChildSelection(finding, groupName, value) {
  if (!finding.childSelections) finding.childSelections = {}
  finding.childSelections[groupName] = value
}

function togglePeLaterality(finding, value) {
  finding.laterality = finding.laterality === value ? '' : value
}

function resetPeGroup(group) {
  const original = physicalExamGroups.find((item) => item.name === group.name)
  if (!original) return
  group.findings = clone(original.findings)
  group.notes = ''
}

function peAnsweredCount(group) {
  return group.findings.filter((finding) => finding.inputType === 'select' ? Boolean(finding.value) : finding.state !== 'unset').length
}

function save() {
  savedPulse.value = true
  emit('save', clone(draft.value))
  window.setTimeout(() => { savedPulse.value = false }, 650)
}
</script>

<template>
  <section class="manual-editor" :class="{ 'manual-editor--compact': compact }">
    <header class="manual-editor__head">
      <div v-if="!compact">
        <span>Manual editing</span>
        <h3>{{ section.label }}</h3>
      </div>
      <strong v-else class="manual-edit-label"><AppIcon name="edit" :size="14" /> Editing manually</strong>
      <span class="autosave-status"><AppIcon name="check" :size="12" /> Changes saved locally</span>
    </header>

    <div v-if="sectionId === 'code'" class="editor-block">
      <p class="editor-help">Select the code status documented for this encounter.</p>
      <div class="choice-list code-status-grid">
        <label v-for="([label, description]) in codeStatusOptions" :key="label" class="choice-card" :class="{ selected: draft.status === label }">
          <input v-model="draft.status" type="radio" :value="label" />
          <span><strong>{{ label }}</strong><small>{{ description }}</small></span>
        </label>
      </div>
      <label class="form-field form-field--full"><span>Notes</span><textarea v-model="draft.notes" rows="3" placeholder="Add supplemental notes about code status..." /></label>
    </div>

    <div v-else-if="sectionId === 'cc'" class="editor-block">
      <section class="form-section">
        <h4>Medical Necessity</h4>
        <p class="editor-help">Select every reason that supports this encounter.</p>
        <div class="chip-picker">
          <button v-for="item in ['Requested by Nurse', 'Identified as high risk for RTH', 'Follow-up / Testing Lab result(s)', 'New Admission', 'Re-admission', 'Patient Request', 'Regulatory Visit', 'Discharge', 'Other']" :key="item" type="button" :class="{ selected: draft.necessity.includes(item) }" @click="toggleArray(draft.necessity, item)">
            <AppIcon v-if="draft.necessity.includes(item)" name="check" :size="12" />{{ item }}
          </button>
        </div>
      </section>
      <div class="form-grid">
        <label class="form-field"><span>Reason for Visit</span><input v-model="draft.reasonForVisit" /></label>
        <label class="form-field form-field--full"><span>Chief Complaint</span><textarea v-model="draft.complaint" rows="4" placeholder="Enter chief complaint..." /></label>
      </div>
      <section v-if="draft.necessity.includes('Re-admission')" class="form-section readmission-fields">
        <h4>Re-admission Details</h4>
        <p class="editor-help">Complete the structured re-admission fields before saving this section.</p>
        <div class="form-grid">
          <label class="form-field"><span>Prior Discharge Date</span><input v-model="draft.readmission.priorDischargeDate" type="date" /></label>
          <label class="form-field"><span>Facility Previously Discharged From</span><input v-model="draft.readmission.facility" placeholder="Hospital or facility name" /></label>
          <label class="form-field"><span>Reason for Re-admission</span><select v-model="draft.readmission.reason"><option value="">Select reason</option><option>Worsening condition</option><option>Complication from prior stay</option><option>Fall or injury</option><option>Infection</option><option>Medication-related</option><option>Scheduled follow-up</option><option>Patient/family request</option><option>Other</option></select></label>
          <label class="form-field"><span>Hospitalization Since Last Visit?</span><select v-model="draft.readmission.hospitalizationSinceLastVisit"><option>Not specified</option><option>Yes</option><option>No</option></select></label>
        </div>
      </section>
    </div>

    <div v-else-if="sectionId === 'hpi'" class="editor-block">
      <div class="mode-switch" aria-label="HPI documentation style">
        <button type="button" :class="{ active: draft.style === 'free' }" @click="draft.style = 'free'">Free text</button>
        <button type="button" :class="{ active: draft.style === 'structured' }" @click="draft.style = 'structured'">Structured</button>
      </div>
      <div class="quality-banner"><AppIcon name="shield" :size="16" /><span><strong>HPI quality check</strong><small>Reason for visit addressed · chronology present · pertinent negatives included</small></span><b>92%</b></div>
      <label class="form-field form-field--full"><span>{{ draft.style === 'free' ? 'HPI Narrative' : 'Generated HPI' }}</span><textarea v-model="draft.note" rows="11" :placeholder="draft.style === 'free' ? 'Write the HPI here. Your formatting will be preserved.' : 'The HPI generated from the structured template will appear here.'" /></label>
      <div v-if="draft.style === 'structured'" class="form-grid structured-hpi">
        <label class="form-field"><span>Chief Complaint</span><input v-model="draft.structured.chiefComplaint" /></label>
        <label class="form-field"><span>Onset</span><input v-model="draft.structured.onset" /></label>
        <label class="form-field"><span>Location</span><input v-model="draft.structured.location" /></label>
        <label class="form-field"><span>Duration</span><input v-model="draft.structured.duration" /></label>
        <label class="form-field"><span>Character</span><input v-model="draft.structured.character" /></label>
        <label class="form-field"><span>Aggravating Factors</span><input v-model="draft.structured.aggravatingFactors" /></label>
        <label class="form-field"><span>Relieving Factors</span><input v-model="draft.structured.relievingFactors" /></label>
        <label class="form-field"><span>Severity</span><select v-model="draft.structured.severity"><option>Mild</option><option>Moderate</option><option>Severe</option></select></label>
        <label class="form-field form-field--full"><span>Associated Symptoms</span><input v-model="draft.structured.associatedSymptoms" /></label>
      </div>
    </div>

    <div v-else-if="sectionId === 'pmh'" class="editor-block">
      <label class="form-field form-field--full search-add"><span>Search Past Medical History</span><div><input v-model="draft.search" placeholder="Search or enter a condition" @keyup.enter="addPmh" /><button type="button" @click="addPmh">Add condition</button></div></label>
      <div class="selected-list">
        <article v-for="(problem, index) in draft.problems" :key="`${problem}-${index}`"><AppIcon name="clipboard" :size="15" /><span>{{ problem }}</span><button type="button" aria-label="Remove condition" @click="draft.problems.splice(index, 1)"><AppIcon name="x" :size="14" /></button></article>
      </div>
      <div class="condition-catalog">
        <details v-for="group in pmhConditionGroups" :key="group.label" open>
          <summary><strong>{{ group.label }}</strong><span>{{ group.options.filter((item) => draft.problems.includes(item)).length }} selected</span></summary>
          <div class="chip-picker"><button v-for="item in group.options" :key="item" type="button" :class="{ selected: draft.problems.includes(item) }" @click="draft.problems.includes(item) ? draft.problems.splice(draft.problems.indexOf(item), 1) : draft.problems.push(item)"><AppIcon v-if="draft.problems.includes(item)" name="check" :size="12" />{{ item }}</button></div>
        </details>
      </div>
      <label class="form-field form-field--full"><span>Additional Medical History Notes</span><textarea v-model="draft.notes" rows="4" placeholder="Add any additional details about the patient's medical history..." /></label>
    </div>

    <div v-else-if="sectionId === 'psh'" class="editor-block">
      <label class="boolean-row"><input v-model="draft.noPrior" type="checkbox" @change="draft.noPrior && (draft.surgeries = [])" /><span><strong>No prior surgeries</strong><small>Select when no surgical history is known or documented.</small></span></label>
      <label class="form-field form-field--full search-add" :class="{ disabled: draft.noPrior }"><span>Search Surgeries</span><div><input v-model="draft.search" :disabled="draft.noPrior" placeholder="e.g., colostomy, CABG, hip replacement" @keyup.enter="addSurgery" /><button type="button" :disabled="draft.noPrior" @click="addSurgery">Add surgery</button></div></label>
      <div v-if="!draft.noPrior" class="tag-board">
        <span v-for="(surgery, index) in draft.surgeries" :key="surgery">{{ surgery }}<button type="button" @click="draft.surgeries.splice(index, 1)"><AppIcon name="x" :size="11" /></button></span>
      </div>
      <div v-if="!draft.noPrior" class="quick-options"><span>Frequently selected</span><button v-for="item in ['Appendectomy', 'CABG', 'Cholecystectomy', 'Hip replacement', 'Hysterectomy', 'Pacemaker placement']" :key="item" type="button" @click="draft.search = item; addSurgery()">{{ item }}</button></div>
      <label class="form-field form-field--full"><span>Custom Surgical History</span><textarea v-model="draft.notes" rows="4" placeholder="Enter custom surgical history here..." /></label>
    </div>

    <div v-else-if="sectionId === 'social'" class="editor-block">
      <label class="boolean-row"><input v-model="draft.noHistory" type="checkbox" /><span><strong>No social history on file</strong><small>Sets unavailable subsections to Unknown.</small></span></label>
      <div class="social-grid" :class="{ disabled: draft.noHistory }">
        <section v-for="group in socialHistoryGroups" :key="group.key" class="option-group">
          <h4>{{ group.label }} <em v-if="group.required">Required</em></h4>
          <div class="chip-picker chip-picker--small"><button v-for="option in group.options" :key="option" type="button" :disabled="draft.noHistory" :class="{ selected: draft.selections[group.key] === option }" @click="draft.selections[group.key] = option">{{ option }}</button></div>
          <label v-if="group.detailsOn?.includes(draft.selections[group.key])" class="form-field"><span>{{ group.detailLabel }}</span><input v-model="draft.details[group.key]" placeholder="Add details" /></label>
        </section>
      </div>
      <label class="form-field form-field--full"><span>Additional Social History</span><textarea v-model="draft.notes" rows="3" /></label>
    </div>

    <div v-else-if="sectionId === 'family'" class="editor-block">
      <label class="boolean-row"><input v-model="draft.noContribution" type="checkbox" /><span><strong>No contributing family history</strong><small>No family history contributes to the current presentation.</small></span></label>
      <div v-if="!draft.noContribution" class="repeat-list">
        <article v-for="(relative, index) in draft.relatives" :key="index" class="repeat-card">
          <header><strong>Relative {{ index + 1 }}</strong><button type="button" @click="draft.relatives.splice(index, 1)">Remove</button></header>
          <div class="form-grid">
            <label class="form-field"><span>Relationship to Patient</span><select v-model="relative.relationship"><option value="">Select relationship</option><option>Mother</option><option>Father</option><option>Sister</option><option>Brother</option><option>Child</option><option>Grandparent</option><option>Other</option></select></label>
            <label class="form-field"><span>Age of Onset</span><input v-model="relative.ageOfOnset" placeholder="Optional" /></label>
            <div class="form-field form-field--full"><span>Conditions</span><div class="chip-picker"><button v-for="condition in familyConditionOptions" :key="condition" type="button" :class="{ selected: relative.conditions.includes(condition) }" @click="toggleArray(relative.conditions, condition)"><AppIcon v-if="relative.conditions.includes(condition)" name="check" :size="12" />{{ condition }}</button></div></div>
            <label v-if="relative.conditions.includes('Cancer')" class="form-field"><span>Cancer Subtype</span><select v-model="relative.cancerSubtype"><option value="">Select subtype</option><option v-for="type in cancerSubtypeOptions" :key="type">{{ type }}</option></select></label>
            <label class="form-field"><span>Deceased</span><select v-model="relative.deceased"><option>No</option><option>Yes</option><option>Unknown</option></select></label>
            <label class="form-field"><span>Age at death</span><input v-model="relative.age" /></label>
            <label class="boolean-row form-field--full"><input v-model="relative.contributory" type="checkbox" /><span><strong>Contributory to current complaint</strong><small>This family condition affects today's assessment.</small></span></label>
            <label class="form-field form-field--full"><span>Relative Notes</span><textarea v-model="relative.notes" rows="2" /></label>
          </div>
        </article>
        <button type="button" class="add-row-button" @click="addRelative">Add relative</button>
      </div>
      <label class="form-field form-field--full"><span>Additional Family History</span><textarea v-model="draft.notes" rows="3" /></label>
    </div>

    <div v-else-if="sectionId === 'immunizations'" class="editor-block">
      <div class="segmented-status"><button v-for="item in ['Document Vaccines Present', 'No Prior Immunizations', 'Declines All', 'Unable to Provide']" :key="item" type="button" :class="{ active: draft.history === item }" @click="draft.history = item">{{ item }}</button></div>
      <div v-if="draft.history === 'Document Vaccines Present'" class="immunization-picker">
        <h4>Common Immunizations</h4>
        <div class="chip-picker"><button v-for="name in immunizationOptions" :key="name" type="button" :class="{ selected: draft.vaccines.some((item) => item.name === name) }" @click="toggleVaccine(name)"><AppIcon v-if="draft.vaccines.some((item) => item.name === name)" name="check" :size="12" />{{ name }}</button></div>
      </div>
      <div v-if="draft.history === 'Document Vaccines Present'" class="data-grid vaccine-grid">
        <div class="data-grid__head"><span>Vaccine</span><span>Administration date</span><span /></div>
        <div v-for="(vaccine, index) in draft.vaccines" :key="index" class="data-grid__row"><input v-model="vaccine.name" placeholder="Vaccine name" /><input v-model="vaccine.date" placeholder="MM/DD/YYYY" /><button type="button" @click="draft.vaccines.splice(index, 1)"><AppIcon name="x" :size="14" /></button></div>
      </div>
      <button v-if="draft.history === 'Document Vaccines Present'" type="button" class="add-row-button" @click="addVaccine">Add other vaccine</button>
      <label class="form-field form-field--full"><span>Notes</span><textarea v-model="draft.notes" rows="3" /></label>
    </div>

    <div v-else-if="sectionId === 'vitals'" class="editor-block">
      <div class="vitals-legend"><span><i class="normal" /> Within range</span><span><i class="high" /> Out of range</span></div>
      <div class="form-grid"><label class="form-field"><span>Recorded Date & Time</span><input v-model="draft.recordedAt" /></label><label class="form-field"><span>Oxygen Saturation Method</span><input v-model="draft.oxygenMethod" placeholder="Room air, nasal cannula, mask..." /></label></div>
      <div class="vitals-grid">
        <label v-for="vital in draft.values" :key="vital.key" class="vital-card" :class="`is-${vital.status}`"><span>{{ vital.label }}</span><div><input v-model="vital.value" /><em>{{ vital.unit }}</em></div><small>{{ vital.status === 'high' ? 'Outside expected range' : 'Within expected range' }}</small></label>
      </div>
      <label class="form-field form-field--full"><span>Plan of action / Notes</span><textarea v-model="draft.notes" rows="4" placeholder="Write your plan of action here..." /></label>
    </div>

    <div v-else-if="sectionId === 'allergies'" class="editor-block">
      <div class="segmented-status"><button v-for="item in ['Reported allergies', 'No known allergies', 'Unknown']" :key="item" type="button" :class="{ active: draft.historyType === item }" @click="draft.historyType = item">{{ item }}</button></div>
      <label class="boolean-row"><input v-model="draft.reviewed" type="checkbox" /><span><strong>Allergy list reviewed and verified</strong><small>Confirms the current list was reconciled for this encounter.</small></span></label>
      <div v-if="draft.historyType === 'Reported allergies'" class="repeat-list">
        <article v-for="(item, index) in draft.items" :key="index" class="repeat-card">
          <header><strong>{{ item.allergen || `Allergy ${index + 1}` }}</strong><span class="status-dot is-red">{{ item.status }}</span><button type="button" @click="draft.items.splice(index, 1)">Remove</button></header>
          <div class="form-grid">
            <label class="form-field"><span>Allergen</span><input v-model="item.allergen" /></label>
            <label class="form-field"><span>Category</span><select v-model="item.category"><option>Medication</option><option>Food</option><option>Environmental</option><option>Biologic</option></select></label>
            <label class="form-field"><span>Clinical Status</span><select v-model="item.status"><option>Active</option><option>Inactive</option><option>Resolved</option><option>Prior history</option></select></label>
            <label class="form-field"><span>Type</span><select v-model="item.type"><option>Allergy</option><option>Intolerance</option><option>Unknown</option></select></label>
            <label class="form-field"><span>Severity</span><select v-model="item.severity"><option>Mild</option><option>Moderate</option><option>Severe</option><option>Unknown</option></select></label>
            <label class="form-field"><span>Onset Date</span><input v-model="item.onsetDate" type="text" placeholder="MM/DD/YYYY or Unknown" /></label>
            <label class="form-field"><span>Reaction Type</span><input v-model="item.reaction" placeholder="e.g., Dermatologic" /></label>
            <label class="form-field"><span>Reaction Sub Type</span><input v-model="item.reactionSubType" placeholder="e.g., Rash, hives" /></label>
            <label class="form-field form-field--full"><span>Reaction Note</span><textarea v-model="item.notes" rows="3" placeholder="Write reaction details..." /></label>
          </div>
        </article>
        <button type="button" class="add-row-button" @click="addAllergy">Add allergy</button>
      </div>
    </div>

    <div v-else-if="sectionId === 'meds'" class="editor-block">
      <label class="boolean-row"><input v-model="draft.reconciled" type="checkbox" /><span><strong>Medication list reconciled and verified</strong><small>Confirms names, doses, routes, frequencies, and statuses.</small></span></label>
      <label class="form-field form-field--full"><span>Find medication</span><input v-model="draft.search" placeholder="Search medication catalog..." /></label>
      <div class="repeat-list medication-list">
        <article v-for="(item, index) in draft.items" :key="index" class="repeat-card">
          <header><strong>{{ item.name || `Medication ${index + 1}` }}</strong><span class="status-dot" :class="item.status === 'Needs review' ? 'is-gold' : 'is-green'">{{ item.status }}</span><button type="button" @click="draft.items.splice(index, 1)">Remove</button></header>
          <div class="form-grid">
            <label class="form-field"><span>Medication / Medical Supply</span><input v-model="item.name" /></label>
            <label class="form-field"><span>Medication Type</span><select v-model="item.type"><option>Active</option><option>Reduction</option><option>Proton Pump Inhibitor (PPI)</option></select></label>
            <label class="form-field"><span>Form</span><input v-model="item.form" placeholder="Tablet, capsule, solution..." /></label>
            <label class="form-field"><span>Strength</span><input v-model="item.strength" placeholder="e.g., 20 mg" /></label>
            <label class="form-field form-field--full"><span>Direction / Sig</span><textarea v-model="item.direction" rows="2" /></label>
            <label class="form-field"><span>Route</span><select v-model="item.route"><option>Oral</option><option>Topical</option><option>Subcutaneous</option><option>Intramuscular</option><option>Intravenous</option><option>Inhalation</option><option>Ophthalmic</option><option>Otic</option><option>Rectal</option><option>Other</option></select></label>
            <label class="form-field"><span>Frequency</span><input v-model="item.frequency" placeholder="Daily, BID, PRN..." /></label>
            <label class="form-field"><span>Quantity</span><input v-model="item.quantity" /></label>
            <label class="form-field"><span>Unit</span><input v-model="item.unit" placeholder="tablet, mL..." /></label>
            <label class="form-field"><span>Refills</span><input v-model="item.refills" /></label>
            <label class="form-field"><span>Status</span><select v-model="item.status"><option>Active</option><option>Needs review</option><option>Discontinued</option></select></label>
            <label class="form-field"><span>Start Date</span><input v-model="item.startDate" type="date" /></label>
            <label class="form-field"><span>Revision Date</span><input v-model="item.revisionDate" type="date" /></label>
            <label class="boolean-row form-field--full"><input v-model="item.useGeneric" type="checkbox" /><span><strong>Use generic medication</strong><small>Prescribe using the generic product name.</small></span></label>
            <label class="boolean-row form-field--full"><input v-model="item.autoComplete" type="checkbox" /><span><strong>Automatically complete after Revision Date</strong><small>Ends this medication when the revision date is reached.</small></span></label>
            <label class="form-field form-field--full"><span>Pharmacy Notes</span><textarea v-model="item.pharmacyNotes" rows="2" /></label>
          </div>
        </article>
        <button type="button" class="add-row-button" @click="addMedication">Add medication</button>
      </div>
      <label class="form-field form-field--full"><span>Notes</span><textarea v-model="draft.notes" rows="3" /></label>
    </div>

    <div v-else-if="sectionId === 'ros'" class="editor-block ros-editor">
      <section class="form-section ros-source-section">
        <div class="ros-section-heading">
          <div><h4>Are you able to obtain Review of Systems (RoS) findings?</h4><p class="editor-help">Select the source before documenting findings.</p></div>
          <button type="button" class="text-action" :disabled="!draft.source" @click="clearRosSource">Clear selection</button>
        </div>
        <div class="source-cards">
          <label v-for="item in [
            { value: 'Directly from patient', label: 'Yes. Directly from patient' },
            { value: 'From staff / caregiver', label: 'Yes. But not directly from patient' },
            { value: 'Unable to obtain', label: 'No. Unable to obtain RoS findings' },
          ]" :key="item.value" :class="{ selected: draft.source === item.value }">
            <input :checked="draft.source === item.value" type="radio" :value="item.value" @change="setRosSource(item.value)" />
            <span>{{ item.label }}</span>
          </label>
        </div>
      </section>
      <section v-if="draft.source === 'From staff / caregiver'" class="form-section">
        <h4>Who provided the Review of Systems findings?</h4>
        <div class="checkbox-grid">
          <label v-for="item in ['Nursing staff / Caregivers', 'Family members / Legal guardians', 'Review of prior medical records', 'Other external sources']" :key="item"><input v-model="draft.otherSources" type="checkbox" :value="item" /><span>{{ item }}</span></label>
        </div>
      </section>
      <section v-if="draft.source === 'Unable to obtain'" class="form-section">
        <div class="form-grid">
          <label class="form-field"><span>Reason RoS Could Not Be Obtained</span><select v-model="draft.unableReason" @change="draft.unableReason !== 'Others' && (draft.unableReasonDetail = '')"><option value="">Select a reason</option><option>Patient is Unresponsive</option><option>Patient has Dementia</option><option>AMS</option><option>Others</option></select></label>
          <label v-if="draft.unableReason === 'Others'" class="form-field"><span>Reason Details</span><input v-model="draft.unableReasonDetail" placeholder="Add clinical context" /></label>
        </div>
      </section>
      <template v-if="draft.source === 'Directly from patient' || draft.source === 'From staff / caregiver'">
        <div class="ros-master-row">
          <div><strong>Systems Review</strong><small>Use Denies All only when every listed symptom was reviewed and denied.</small></div>
          <button type="button" class="switch-control" :class="{ active: allRosNegative() }" role="switch" :aria-checked="allRosNegative()" @click="toggleDeniesAll"><i /><span>Denies All</span></button>
        </div>
        <div class="ros-category-list">
          <article v-for="group in rosGroups" :key="group.name" class="ros-category-card" :class="{ open: isRosGroupOpen(group.name) }">
            <header class="ros-category-header">
              <button type="button" class="ros-category-toggle" :aria-expanded="isRosGroupOpen(group.name)" @click="toggleRosGroup(group.name)">
                <AppIcon name="chevronDown" :size="16" />
                <strong>{{ group.name }}</strong>
                <span v-if="Object.values(draft.findings[group.name] || {}).some((value) => value !== 'unset')" class="ros-tally">
                  <template v-if="Object.values(draft.findings[group.name] || {}).filter((value) => value === 'positive').length"><em>Reports</em><b class="reports">{{ Object.values(draft.findings[group.name] || {}).filter((value) => value === 'positive').length }}</b></template>
                  <template v-if="Object.values(draft.findings[group.name] || {}).filter((value) => value === 'negative').length"><em>Denies</em><b class="denies">{{ Object.values(draft.findings[group.name] || {}).filter((value) => value === 'negative').length }}</b></template>
                </span>
              </button>
              <button type="button" class="switch-control switch-control--small" :class="{ active: rosGroupAllNegative(group) }" role="switch" :aria-checked="rosGroupAllNegative(group)" @click="toggleRosGroupDenies(group)"><i /><span>Denies All</span></button>
            </header>
            <div v-if="isRosGroupOpen(group.name)" class="body-system-findings">
              <div v-for="symptom in group.symptoms" :key="symptom" class="body-system-row" :class="[`is-${draft.findings[group.name]?.[symptom] || 'unset'}`]">
                <div class="ros-symptom-name">
                  <span>{{ symptom }}</span>
                  <button v-if="draft.findings[group.name]?.[symptom] && draft.findings[group.name]?.[symptom] !== 'unset'" type="button" :class="{ active: rosNoteEditing === rosSymptomKey(group.name, symptom) || draft.notesBySymptom?.[rosSymptomKey(group.name, symptom)] }" :aria-label="`Add note for ${symptom}`" @click="toggleRosNote(group.name, symptom)"><AppIcon name="edit" :size="13" /></button>
                </div>
                <div class="finding-state" role="group" :aria-label="symptom">
                  <button type="button" :class="{ denied: draft.findings[group.name]?.[symptom] === 'negative' }" :aria-pressed="draft.findings[group.name]?.[symptom] === 'negative'" @click="setRosState(group.name, symptom, 'negative')"><AppIcon name="minus" :size="13" /> Denies</button>
                  <button type="button" :class="{ present: draft.findings[group.name]?.[symptom] === 'positive' }" :aria-pressed="draft.findings[group.name]?.[symptom] === 'positive'" @click="setRosState(group.name, symptom, 'positive')"><AppIcon name="plus" :size="13" /> Reports</button>
                </div>
                <label v-if="rosNoteEditing === rosSymptomKey(group.name, symptom)" class="form-field ros-symptom-note"><span>Finding note</span><input v-model="draft.notesBySymptom[rosSymptomKey(group.name, symptom)]" :placeholder="`Add context for ${symptom}...`" /></label>
              </div>
              <label class="form-field system-note"><span>Additional Comments – {{ group.name }}</span><textarea v-model="draft.notesBySystem[group.name]" rows="2" :placeholder="`Summarize key ${group.name.toLowerCase()} findings or context...`" /></label>
            </div>
          </article>
        </div>
      </template>
      <label class="form-field form-field--full"><span>Additional ROS</span><textarea v-model="draft.notes" rows="3" /></label>
    </div>

    <div v-else-if="sectionId === 'pe'" class="editor-block pe-editor">
      <div class="pe-toolbar"><span>Use each finding's original control. Green indicates normal; red indicates abnormal.</span><button type="button" @click="setAllPeNormal"><AppIcon name="checkCheck" :size="13" /> Set all normal</button></div>
      <div class="body-system-list pe-groups">
        <details v-for="group in draft.groups" :key="group.name" open>
          <summary>
            <span><strong>{{ group.name }}</strong><small>{{ peAnsweredCount(group) }} of {{ group.findings.length }} documented · {{ group.findings.filter((finding) => isPeAbnormal(finding)).length }} abnormal</small></span>
            <span class="pe-summary-actions"><button type="button" @click.stop.prevent="resetPeGroup(group)">Reset Findings</button><AppIcon name="chevronDown" :size="15" /></span>
          </summary>
          <div class="pe-findings">
            <div v-for="finding in group.findings" :key="finding.name" class="pe-finding-row" :class="{ 'is-abnormal': isPeAbnormal(finding), 'is-normal': peNormality(finding) === 'normal' }">
              <div class="pe-finding-main">
                <span>{{ finding.name }}</span>
                <select v-if="finding.inputType === 'select'" :value="finding.value" :class="{ 'is-abnormal': isPeAbnormal(finding) }" @change="selectPeOption(finding, $event.target.value)"><option value="">Select...</option><option v-for="option in finding.options" :key="option" :value="option">{{ option }}</option></select>
                <div v-else class="pe-toggle" role="group" :aria-label="finding.name">
                  <button type="button" :class="{ active: finding.state === 'positive', 'tone-normal': finding.state === 'positive' && finding.polarity === 'normal_when_present', 'tone-abnormal': finding.state === 'positive' && finding.polarity === 'abnormal_when_present' }" :aria-pressed="finding.state === 'positive'" @click="setPeToggle(finding, 'positive')">{{ peToggleLabels(finding).positive }}</button>
                  <button type="button" :class="{ active: finding.state === 'negative', 'tone-normal': finding.state === 'negative' && finding.polarity === 'abnormal_when_present', 'tone-abnormal': finding.state === 'negative' && finding.polarity === 'normal_when_present' }" :aria-pressed="finding.state === 'negative'" @click="setPeToggle(finding, 'negative')">{{ peToggleLabels(finding).negative }}</button>
                </div>
              </div>

              <div v-if="showPeChildren(finding)" class="pe-detail-options">
                <template v-if="finding.detailMode === 'joint-multi'">
                  <small>Joint findings</small>
                  <div class="pe-joint-grid">
                    <div v-for="joint in jointDetailGroups(finding)" :key="joint.name" class="pe-child-row"><span>{{ joint.name }}</span><div class="pe-multi-toggle"><button v-for="option in joint.options" :key="option.value" type="button" :class="{ active: finding.selectedDetails.includes(option.value) }" @click="toggleJointDetail(finding, option.value)">{{ option.label }}</button></div></div>
                  </div>
                </template>
                <template v-else-if="finding.detailMode === 'mental-status'">
                  <small>Mental status findings</small>
                  <div class="pe-structured-children">
                    <label v-for="child in finding.childGroups" :key="child.name" class="form-field"><span>{{ child.name }}</span>
                      <select v-if="child.type === 'select'" :value="finding.childSelections?.[child.name] || ''" @change="setPeChildSelection(finding, child.name, $event.target.value)"><option value="">Select...</option><option v-for="option in child.options" :key="option">{{ option }}</option></select>
                      <span v-else class="pe-chip-row"><button v-for="option in child.options" :key="option" type="button" :class="{ active: finding.childSelections?.[child.name]?.includes(option) }" @click="togglePeChildChip(finding, child.name, option)">{{ option }}</button></span>
                    </label>
                  </div>
                </template>
                <template v-else-if="finding.detailMode === 'single-select'">
                  <label class="form-field"><span>Detailed finding</span><select :value="finding.selectedDetails[0] || ''" @change="setSinglePeDetail(finding, $event.target.value)"><option value="">Select...</option><option v-for="detail in finding.detailOptions" :key="detail">{{ detail }}</option></select></label>
                </template>
                <template v-else-if="finding.detailMode === 'single-toggle'">
                  <small>Abnormality</small><div class="pe-multi-toggle"><button v-for="detail in finding.detailOptions" :key="detail" type="button" :class="{ active: finding.selectedDetails.includes(detail) }" @click="setSinglePeDetail(finding, finding.selectedDetails.includes(detail) ? '' : detail)">{{ detail }}</button></div>
                </template>
                <template v-else>
                  <small>Detailed findings</small>
                  <div class="pe-child-list">
                    <div v-for="detail in finding.detailOptions" :key="detail" class="pe-child-row" :class="{ 'is-abnormal': childStateIsAbnormal(finding, detail, finding.detailStates?.[detail]) }"><span>{{ detail }}</span><div class="pe-toggle pe-toggle--child"><button type="button" :class="{ active: finding.detailStates?.[detail] === 'positive', 'tone-normal': finding.detailStates?.[detail] === 'positive' && finding.normalChildren?.includes(detail), 'tone-abnormal': finding.detailStates?.[detail] === 'positive' && !finding.normalChildren?.includes(detail) }" @click="setPeChildState(finding, detail, 'positive')">Present</button><button type="button" :class="{ active: finding.detailStates?.[detail] === 'negative', 'tone-normal': finding.detailStates?.[detail] === 'negative' && !finding.normalChildren?.includes(detail), 'tone-abnormal': finding.detailStates?.[detail] === 'negative' && finding.normalChildren?.includes(detail) }" @click="setPeChildState(finding, detail, 'negative')">Absent</button></div></div>
                  </div>
                </template>
              </div>

              <div v-if="showPeDetails(finding) || showPeLaterality(finding)" class="pe-extras">
                <label v-if="showPeDetails(finding)" class="form-field"><span>Details</span><input v-model="finding.detail" :placeholder="finding.detailPlaceholder" /></label>
                <div v-if="showPeLaterality(finding)" class="form-field pe-laterality"><span>Laterality</span><div class="laterality-buttons"><button v-for="side in [{ value: 'Left', label: 'L' }, { value: 'Bilateral', label: 'Bilat' }, { value: 'Right', label: 'R' }]" :key="side.value" type="button" :class="{ active: finding.laterality === side.value }" :title="side.value" @click="togglePeLaterality(finding, side.value)">{{ side.label }}</button></div></div>
              </div>
            </div>
            <label class="form-field system-note"><span>Additional Comments – {{ group.name }}</span><textarea v-model="group.notes" rows="2" placeholder="Add details for this body system..." /></label>
          </div>
        </details>
      </div>
      <section class="device-section">
        <div class="section-intro"><div><h4>Physical Devices and Treatments</h4><p>Select every device or active treatment observed for this patient.</p></div></div>
        <details v-for="deviceGroup in peDeviceGroups" :key="deviceGroup.name" class="device-group" open>
          <summary><span><strong>{{ deviceGroup.name }}</strong><small>{{ deviceGroup.items.filter((item) => draft.devices[item]).length }} selected</small></span><AppIcon name="chevronDown" :size="15" /></summary>
          <div class="checkbox-grid device-grid"><label v-for="item in deviceGroup.items" :key="item"><input v-model="draft.devices[item]" type="checkbox" /><span>{{ item }}</span></label></div>
        </details>
        <div v-if="draft.devices['O2 Therapy']" class="form-grid oxygen-fields"><label class="form-field"><span>Oxygen Flow Rate</span><input v-model="draft.oxygenFlowRate" placeholder="e.g., 2 L/min" /></label></div>
        <label class="form-field form-field--full"><span>Device / Treatment Notes</span><textarea v-model="draft.deviceNotes" rows="3" /></label>
      </section>
      <label class="form-field form-field--full"><span>Additional Physical Exam</span><textarea v-model="draft.notes" rows="3" /></label>
    </div>

    <div v-else-if="sectionId === 'labs'" class="editor-block">
      <section class="diagnostic-panel">
        <header><div><h4>Unreviewed Diagnostic Results</h4><p>Results imported from the resident chart.</p></div><button type="button"><AppIcon name="refresh" :size="13" /> Refresh</button></header>
        <article v-for="item in draft.diagnostics" :key="item.name"><span :class="item.type === 'Laboratory' ? 'lab-icon' : 'image-icon'"><AppIcon :name="item.type === 'Laboratory' ? 'flask' : 'eye'" :size="15" /></span><div><strong>{{ item.name }}</strong><small>{{ item.summary }}</small></div><time>{{ item.date }}</time><em>{{ item.status }}</em></article>
      </section>
      <div class="form-grid">
        <label class="form-field"><span>Laboratory</span><textarea v-model="draft.laboratoryNotes" rows="7" placeholder="Laboratory notes here..." /></label>
        <label class="form-field"><span>Imaging</span><textarea v-model="draft.imagingNotes" rows="7" placeholder="Imaging notes here..." /></label>
      </div>
    </div>

    <div v-else-if="sectionId === 'ap'" class="editor-block">
      <div class="section-intro"><div><h4>Problems, Assessment, and Treatment Plans</h4><p>Document one assessment and treatment plan for each active problem.</p></div><button type="button" class="add-row-button" @click="addProblem">Add problem</button></div>
      <div class="repeat-list problem-list">
        <article v-for="(problem, index) in draft.problems" :key="index" class="repeat-card problem-card">
          <header><strong>Problem {{ index + 1 }}</strong><span class="status-dot is-purple">{{ problem.code || 'ICD-10' }}</span><button type="button" @click="draft.problems.splice(index, 1)">Remove</button></header>
          <div class="form-grid">
            <label class="form-field"><span>Diagnosis</span><input v-model="problem.diagnosis" /></label>
            <label class="form-field"><span>ICD-10 Code</span><input v-model="problem.code" /></label>
            <label class="form-field"><span>Status</span><select v-model="problem.status"><option>Active</option><option>Stable</option><option>Improving</option><option>Worsening</option><option>Resolved</option><option>Not at goal</option></select></label>
            <label class="form-field form-field--full"><span>Assessment Note</span><textarea v-model="problem.assessment" rows="3" /></label>
            <label class="form-field form-field--full"><span>Treatment Plan</span><textarea v-model="problem.plan" rows="3" /></label>
            <div class="form-field form-field--full"><span>Treatment Categories</span><div class="chip-picker"><button v-for="item in ['Medications', 'Laboratory Tests', 'Imaging Studies', 'Other Interventions']" :key="item" type="button" :class="{ selected: problem.treatments.includes(item) }" @click="toggleArray(problem.treatments, item)"><AppIcon v-if="problem.treatments.includes(item)" name="check" :size="12" />{{ item }}</button></div></div>
            <label class="form-field"><span>Action</span><input v-model="problem.action" placeholder="Continue, start, adjust, monitor..." /></label>
            <label class="form-field"><span>Responsible Party</span><input v-model="problem.responsibleParty" placeholder="Provider, nursing, therapy..." /></label>
            <label class="form-field"><span>Timing</span><input v-model="problem.timing" placeholder="Today, daily, within 7 days..." /></label>
            <label class="form-field"><span>Follow-up</span><input v-model="problem.followUp" placeholder="Follow-up instructions" /></label>
          </div>
        </article>
      </div>
      <label class="form-field form-field--full medical-decision"><span>Medical Decision Making Notes</span><textarea v-model="draft.medicalDecision" rows="6" placeholder="Decision notes will be generated here..." /></label>
    </div>

    <div v-else-if="sectionId === 'notes'" class="editor-block notes-editor">
      <label class="form-field form-field--full"><span>Provider Visit Note / Transcript</span><textarea v-model="draft.text" rows="18" placeholder="Enter the provider's final Visit Note or transcribed encounter audio..." /></label>
      <small>This source was captured in SAGE Encounter after the provider ended the visit. Agents use it to draft and answer every clinical section.</small>
    </div>

    <div v-else-if="sectionId === 'screenings'" class="editor-block">
      <div class="screening-list">
        <article v-for="item in draft.items" :key="item.name" class="screening-card">
          <header><div><strong>{{ item.name }}</strong><small>{{ item.result }}</small></div><label><input v-model="item.completed" type="checkbox" /> Mark as completed</label></header>
          <div class="screening-fields">
            <label class="form-field"><span>Score / Result</span><input v-model="item.score" /></label>
            <label class="form-field"><span>Interpretation</span><input v-model="item.result" /></label>
            <label class="form-field"><span>Completed Date</span><input v-model="item.completedAt" /></label>
            <span class="screening-result" :class="{ caution: item.result.toLowerCase().includes('risk') || item.result.toLowerCase().includes('impairment') }">{{ item.result }}</span>
            <div v-if="item.type === 'tug'" class="form-field form-field--full"><span>Mobility Observations</span><div class="chip-picker"><button v-for="observation in ['Slow tentative pace', 'Short strides', 'Little or no arm swing', 'Steadying self on walls', 'Shuffling', 'En bloc turning', 'Improper walking aid use']" :key="observation" type="button" :class="{ selected: item.observations.includes(observation) }" @click="toggleArray(item.observations, observation)">{{ observation }}</button></div></div>
            <template v-else-if="item.type === 'sdoh'"><label class="boolean-row form-field--full"><input v-model="item.declined" type="checkbox" /><span><strong>Patient declined screening</strong><small>Document when SDOH questions could not be completed.</small></span></label><div class="form-field form-field--full"><span>Identified Needs</span><div class="chip-picker"><button v-for="need in ['Food insecurity', 'Housing instability', 'Transportation', 'Utilities', 'Safety', 'Social isolation', 'Financial strain']" :key="need" type="button" :class="{ selected: item.needs.includes(need) }" @click="toggleArray(item.needs, need)">{{ need }}</button></div></div></template>
            <label v-else-if="item.type === 'phq9'" class="form-field form-field--full"><span>Difficulty Caused by Symptoms</span><select v-model="item.difficulty"><option>Not difficult at all</option><option>Somewhat difficult</option><option>Very difficult</option><option>Extremely difficult</option></select></label>
            <label v-else class="form-field form-field--full"><span>Screening Details</span><textarea v-model="item.detail" rows="2" /></label>
          </div>
        </article>
      </div>
    </div>

    <div v-else-if="sectionId === 'cpt'" class="editor-block">
      <div class="quality-banner"><AppIcon name="info" :size="16" /><span><strong>Patient-presence requirement</strong><small>Only select a nursing facility E/M code when the provider personally saw the patient.</small></span></div>
      <label class="form-field form-field--full search-add"><span>Search CPT Code or Description</span><div><input v-model="draft.search" placeholder="e.g., 99309 or subsequent nursing facility care" @keyup.enter="addCpt" /><button type="button" @click="addCpt">Add code</button></div></label>
      <div v-if="draft.codes.filter((item) => ['99304', '99305', '99306', '99307', '99308', '99309', '99310'].includes(item.code)).length > 1" class="validation-banner"><AppIcon name="alert" :size="15" /><span><strong>Choose one primary nursing-facility E/M code.</strong><small>Initial and subsequent nursing-facility codes are mutually exclusive for a single encounter.</small></span></div>
      <div class="cpt-list">
        <article v-for="(item, index) in draft.codes" :key="index"><label><input type="checkbox" checked /><span><strong>{{ item.code }}</strong><small>{{ item.description }}</small></span></label><label class="form-field"><span>Modifiers</span><input v-model="item.modifiers" placeholder="e.g., 25" /></label><button type="button" @click="draft.codes.splice(index, 1)">Remove</button></article>
      </div>
      <section class="cpt-catalog"><h4>CPT / HCPCS Catalog</h4><div class="choice-list"><button v-for="item in cptCatalog" :key="item[0]" type="button" :class="{ selected: draft.codes.some((code) => code.code === item[0]) }" @click="toggleCptOption(item)"><span><strong>{{ item[0] }}</strong><small>{{ item[1] }}</small></span><AppIcon :name="draft.codes.some((code) => code.code === item[0]) ? 'checkCheck' : 'plus'" :size="15" /></button></div></section>
    </div>

    <footer v-if="showActions" class="manual-editor__actions">
      <button type="button" class="button button--secondary" @click="emit('cancel')">Cancel</button>
      <button type="button" class="button button--mint" @click="save"><AppIcon :name="savedPulse ? 'checkCheck' : 'check'" :size="14" /> Save section</button>
    </footer>
  </section>
</template>

<style scoped>
.manual-editor { background: #fff; border: 1px solid var(--border); border-radius: 9px; overflow: hidden; }
.manual-editor__head { align-items: center; background: #FBFBFC; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; padding: 14px 18px; }
.manual-editor__head > div > span { color: var(--purple); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.manual-editor__head h3 { font-size: 20px; margin: 3px 0 0; }
.manual-edit-label { align-items: center; color: var(--purple-dark); display: flex; font-size: 12px; gap: 6px; }
.autosave-status { align-items: center; color: #218C69; display: flex; font-size: 11px; font-weight: 700; gap: 5px; }
.editor-block { display: flex; flex-direction: column; gap: 18px; padding: 20px; }
.editor-help { color: var(--muted); font-size: 12.5px; line-height: 19px; margin: -4px 0 0; }
.choice-list { display: grid; gap: 7px; }
.code-status-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.choice-card { align-items: flex-start; border: 1px solid var(--border); border-radius: 7px; cursor: pointer; display: flex; gap: 10px; padding: 13px 14px; }
.choice-card.selected { background: var(--purple-soft); border-color: #CDBCEB; }
.choice-card input { accent-color: var(--purple); margin-top: 3px; }
.choice-card span { display: flex; flex-direction: column; gap: 3px; }
.choice-card strong { font-size: 13.5px; }
.choice-card small { color: var(--muted); font-size: 11.5px; line-height: 17px; }
.form-section { border-bottom: 1px solid #EEF1F4; padding-bottom: 16px; }
.form-section h4, .option-group h4, .section-intro h4, .diagnostic-panel h4 { font-size: 14px; margin: 0 0 4px; }
.form-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.form-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.form-field > span { color: var(--muted); font-size: 11.5px; font-weight: 800; letter-spacing: .02em; }
.form-field input, .form-field textarea, .form-field select, .data-grid input, .pe-findings input, .pe-findings select { background: #fff; border: 1px solid #D9DCE1; border-radius: 5px; color: var(--ink); font-size: 13.5px; outline: 0; padding: 10px 11px; width: 100%; }
.form-field textarea { line-height: 21px; resize: vertical; }
.form-field input:focus, .form-field textarea:focus, .form-field select:focus, .data-grid input:focus { border-color: #A991D6; box-shadow: 0 0 0 3px rgba(132,94,194,.08); }
.form-field--full { grid-column: 1 / -1; }
.form-field.disabled, .social-grid.disabled { opacity: .55; }
.chip-picker { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
.chip-picker button, .quick-options button { background: #fff; border: 1px solid #D9DCE1; border-radius: 999px; color: var(--muted); cursor: pointer; font-size: 12px; min-height: 32px; padding: 6px 11px; }
.chip-picker button.selected { background: var(--purple-soft); border-color: #BFAADE; color: var(--purple-dark); font-weight: 700; }
.chip-picker button { align-items: center; display: inline-flex; gap: 4px; }
.chip-picker--small button { font-size: 9px; min-height: 26px; padding: 4px 8px; }
.mode-switch { background: #F1F2F4; border-radius: 6px; display: flex; padding: 3px; width: fit-content; }
.mode-switch button, .segmented-status button { background: transparent; border: 0; border-radius: 4px; color: var(--muted); cursor: pointer; font-size: 11px; font-weight: 700; padding: 7px 12px; }
.mode-switch button.active, .segmented-status button.active { background: #fff; box-shadow: 0 1px 3px rgba(28,25,46,.12); color: var(--purple); }
.quality-banner { align-items: center; background: var(--green-soft); border: 1px solid #CDEFE6; border-radius: 7px; color: #218C69; display: flex; gap: 9px; padding: 10px 12px; }
.quality-banner span { display: flex; flex: 1; flex-direction: column; gap: 2px; }
.quality-banner strong { font-size: 11px; }
.quality-banner small { color: var(--muted); font-size: 9px; }
.quality-banner b { font-size: 13px; }
.structured-hpi { background: #F8F9FA; border-radius: 7px; padding: 12px; }
.search-add > div { display: flex; }
.search-add > div input { border-radius: 5px 0 0 5px; }
.search-add > div button, .add-row-button { background: var(--purple); border: 1px solid var(--purple); border-radius: 5px; color: #fff; cursor: pointer; font-size: 11px; font-weight: 700; padding: 8px 12px; white-space: nowrap; }
.search-add > div button { border-radius: 0 5px 5px 0; }
.selected-list { display: grid; gap: 6px; }
.selected-list article { align-items: center; background: #F8F9FA; border: 1px solid #EEF1F4; border-radius: 6px; display: flex; gap: 8px; padding: 8px 10px; }
.selected-list article span { flex: 1; font-size: 13px; }
.selected-list article button, .tag-board button, .data-grid__row button { background: transparent; border: 0; color: var(--subtle); cursor: pointer; padding: 2px; }
.quick-options { align-items: center; display: flex; flex-wrap: wrap; gap: 6px; }
.quick-options > span { color: var(--subtle); font-size: 10px; font-weight: 700; margin-right: 2px; }
.quick-options button { border-style: dashed; font-size: 10px; min-height: 27px; padding: 4px 8px; }
.boolean-row { align-items: flex-start; background: #F8F9FA; border: 1px solid #EEF1F4; border-radius: 7px; display: flex; gap: 9px; padding: 10px 12px; }
.boolean-row input { accent-color: var(--mint); margin-top: 3px; }
.boolean-row span { display: flex; flex-direction: column; gap: 2px; }
.boolean-row strong { font-size: 12.5px; }
.boolean-row small { color: var(--muted); font-size: 10.5px; }
.tag-board { display: flex; flex-wrap: wrap; gap: 7px; }
.tag-board > span { align-items: center; background: var(--purple-soft); border: 1px solid #E5DBFA; border-radius: 999px; color: var(--purple-dark); display: flex; font-size: 11px; font-weight: 700; gap: 5px; padding: 6px 9px; }
.social-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.option-group { border: 1px solid #EEF1F4; border-radius: 7px; padding: 12px; }
.option-group h4 { align-items: center; display: flex; gap: 7px; }
.option-group h4 em { background: #FFF4E8; border-radius: 999px; color: #9A5D13; font-size: 8px; font-style: normal; letter-spacing: .04em; padding: 3px 6px; text-transform: uppercase; }
.option-group .form-field { margin-top: 10px; }
.repeat-list { display: flex; flex-direction: column; gap: 9px; }
.repeat-card { border: 1px solid var(--border); border-radius: 7px; padding: 12px; }
.repeat-card > header { align-items: center; border-bottom: 1px solid #EEF1F4; display: flex; gap: 8px; margin: -2px 0 11px; padding-bottom: 8px; }
.repeat-card > header strong { flex: 1; font-size: 13px; }
.repeat-card > header > button, .cpt-list article > button { background: transparent; border: 0; color: #C9302C; cursor: pointer; font-size: 9px; font-weight: 700; }
.segmented-status { background: #F1F2F4; border-radius: 6px; display: flex; padding: 3px; width: fit-content; }
.data-grid { border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.data-grid__head, .data-grid__row { align-items: center; display: grid; gap: 9px; grid-template-columns: 1fr 180px 26px; padding: 8px 10px; }
.data-grid__head { background: #F8F9FA; color: var(--subtle); font-size: 9px; font-weight: 800; text-transform: uppercase; }
.data-grid__row + .data-grid__row { border-top: 1px solid #EEF1F4; }
.vitals-legend { display: flex; gap: 14px; justify-content: flex-end; }
.vitals-legend span { align-items: center; color: var(--muted); display: flex; font-size: 9px; gap: 5px; }
.vitals-legend i { border-radius: 50%; height: 7px; width: 7px; }
.vitals-legend i.normal { background: var(--green); }
.vitals-legend i.high { background: #D3524B; }
.vitals-grid { display: grid; gap: 9px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.vital-card { background: #fff; border: 1px solid var(--border); border-radius: 7px; border-top: 3px solid var(--green); display: flex; flex-direction: column; gap: 7px; padding: 10px; }
.vital-card.is-high { background: #FFF9F9; border-color: #F0B7B4; border-top-color: #D3524B; }
.vital-card > span { color: var(--muted); font-size: 9px; font-weight: 700; }
.vital-card div { align-items: baseline; display: flex; gap: 4px; }
.vital-card input { background: transparent; border: 0; font-size: 18px; font-weight: 800; min-width: 0; outline: 0; width: 100%; }
.vital-card em { color: var(--subtle); font-size: 9px; font-style: normal; white-space: nowrap; }
.vital-card small { color: #218C69; font-size: 8px; }
.vital-card.is-high small { color: #C9302C; }
.status-dot { background: #F3F4F6; border-radius: 999px; color: var(--muted); font-size: 8px; font-style: normal; font-weight: 800; padding: 4px 7px; }
.status-dot.is-green { background: var(--green-soft); color: #218C69; }
.status-dot.is-gold { background: #FFF8E6; color: #9A6912; }
.status-dot.is-red { background: #FDECEC; color: #C9302C; }
.status-dot.is-purple { background: var(--purple-soft); color: var(--purple-dark); }
.ros-section-heading { align-items: flex-start; display: flex; gap: 16px; justify-content: space-between; }
.ros-section-heading h4 { margin: 0 0 7px; }
.text-action { background: transparent; border: 0; color: var(--mint-dark, #16836A); cursor: pointer; font-size: 12px; font-weight: 750; padding: 3px 0; text-transform: capitalize; }
.text-action:disabled { color: #A4AAB3; cursor: default; }
.source-cards { display: grid; gap: 9px; grid-template-columns: repeat(3, 1fr); margin-top: 13px; }
.source-cards label { align-items: flex-start; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; display: flex; font-size: 12px; gap: 7px; line-height: 18px; min-height: 58px; padding: 12px 13px; }
.source-cards label.selected { background: #F0FBF7; border-color: #82CEBA; color: #176F5A; font-weight: 750; box-shadow: 0 0 0 2px rgba(38,176,142,.07); }
.source-cards input { accent-color: var(--mint); margin: 3px 0 0; }
.checkbox-grid { display: grid; gap: 7px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 10px; }
.checkbox-grid label { align-items: flex-start; background: #fff; border: 1px solid #E4E7EB; border-radius: 6px; color: var(--muted); cursor: pointer; display: flex; font-size: 11px; gap: 7px; line-height: 16px; padding: 9px 10px; }
.checkbox-grid input { accent-color: var(--mint); margin-top: 2px; }
.clinical-groups { border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.clinical-groups details + details { border-top: 1px solid #EEF1F4; }
.clinical-groups summary { align-items: center; background: #FBFBFC; cursor: pointer; display: flex; list-style: none; padding: 10px 12px; }
.clinical-groups summary strong { flex: 1; font-size: 11px; }
.clinical-groups summary span { color: var(--subtle); font-size: 9px; }
.symptom-grid { display: grid; gap: 6px; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 10px; }
.symptom-grid button { align-items: center; background: var(--green-soft); border: 1px solid #CDEFE6; border-radius: 5px; color: #218C69; cursor: pointer; display: flex; font-size: 10px; gap: 6px; padding: 7px 8px; text-align: left; }
.symptom-grid button.positive { background: #FFF3F3; border-color: #F2C5C2; color: #C9302C; }
.body-system-list { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.body-system-list > details + details { border-top: 1px solid #E8EBEF; }
.body-system-list summary, .device-group summary { align-items: center; background: #FAFBFC; cursor: pointer; display: flex; justify-content: space-between; list-style: none; min-height: 48px; padding: 10px 13px; }
.body-system-list summary::-webkit-details-marker, .device-group summary::-webkit-details-marker { display: none; }
.body-system-list summary > span, .device-group summary > span { display: flex; flex-direction: column; gap: 2px; }
.body-system-list summary strong, .device-group summary strong { color: var(--ink); font-size: 12px; }
.body-system-list summary small, .device-group summary small { color: var(--subtle); font-size: 9px; }
.body-system-list details[open] > summary, .device-group[open] > summary { background: #F7F4FC; color: var(--purple); }
.body-system-list details[open] > summary > svg, .device-group[open] > summary > svg { transform: rotate(180deg); }
.ros-master-row { align-items: center; background: #F8FAFA; border: 1px solid var(--border); border-radius: 8px; display: flex; gap: 16px; justify-content: space-between; padding: 12px 14px; }
.ros-master-row > div { display: flex; flex-direction: column; gap: 3px; }
.ros-master-row strong { font-size: 13px; }
.ros-master-row small { color: var(--muted); font-size: 11px; line-height: 16px; }
.switch-control { align-items: center; background: transparent; border: 0; color: var(--muted); cursor: pointer; display: inline-flex; flex-shrink: 0; font-size: 11px; font-weight: 750; gap: 7px; padding: 4px; }
.switch-control i { background: #C9CDD3; border-radius: 999px; display: block; height: 20px; position: relative; transition: background .18s ease; width: 36px; }
.switch-control i::after { background: #fff; border-radius: 50%; box-shadow: 0 1px 3px rgba(22,30,43,.22); content: ''; height: 16px; left: 2px; position: absolute; top: 2px; transition: transform .18s ease; width: 16px; }
.switch-control.active { color: #18785F; }
.switch-control.active i { background: var(--mint); }
.switch-control.active i::after { transform: translateX(16px); }
.switch-control--small { font-size: 10px; }
.switch-control--small i { height: 18px; width: 32px; }
.switch-control--small i::after { height: 14px; width: 14px; }
.switch-control--small.active i::after { transform: translateX(14px); }
.ros-category-list { display: flex; flex-direction: column; gap: 8px; }
.ros-category-card { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.ros-category-card.open { border-color: #C9C1DB; box-shadow: 0 2px 7px rgba(30,24,46,.05); }
.ros-category-header { align-items: center; background: #fff; display: flex; min-height: 50px; }
.ros-category-card.open .ros-category-header { background: #FAF8FD; }
.ros-category-toggle { align-items: center; align-self: stretch; background: transparent; border: 0; color: var(--ink); cursor: pointer; display: flex; flex: 1; gap: 9px; min-width: 0; padding: 11px 13px; text-align: left; }
.ros-category-toggle > svg { color: var(--subtle); flex: 0 0 auto; transition: transform .18s ease; }
.ros-category-card.open .ros-category-toggle > svg { color: var(--purple); transform: rotate(180deg); }
.ros-category-toggle > strong { font-size: 13px; }
.ros-tally { align-items: center; display: inline-flex; gap: 5px; margin-left: auto; }
.ros-tally em { color: var(--muted); font-size: 10px; font-style: normal; }
.ros-tally b { border-radius: 4px; font-size: 10px; min-width: 21px; padding: 3px 5px; text-align: center; }
.ros-tally b.reports { background: #FCEAE9; color: #B52F2A; }
.ros-tally b.denies { background: #E9F7F1; color: #17765E; }
.ros-category-header > .switch-control { margin-right: 11px; }
.body-system-findings { background: #fff; border-top: 1px solid #E8EBEF; padding: 8px 13px 14px; }
.body-system-row { align-items: center; border-bottom: 1px solid #EDF0F2; display: grid; gap: 12px; grid-template-columns: minmax(180px, 1fr) auto; min-height: 50px; padding: 7px 8px; transition: background .15s ease; }
.body-system-row.is-negative { background: #F2FBF7; }
.body-system-row.is-positive { background: #FFF6F5; }
.ros-symptom-name { align-items: center; display: flex; gap: 7px; min-width: 0; }
.ros-symptom-name > span { color: var(--ink); font-size: 12px; }
.ros-symptom-name > button { align-items: center; background: transparent; border: 0; border-radius: 4px; color: #9299A4; cursor: pointer; display: flex; justify-content: center; padding: 4px; }
.ros-symptom-name > button:hover, .ros-symptom-name > button.active { background: #E9F7F1; color: #17765E; }
.finding-state { background: #F1F3F5; border-radius: 7px; display: flex; gap: 3px; padding: 3px; }
.finding-state button { align-items: center; background: transparent; border: 0; border-radius: 5px; color: var(--subtle); cursor: pointer; display: flex; font-size: 10px; font-weight: 750; gap: 4px; justify-content: center; min-height: 31px; min-width: 82px; padding: 6px 10px; }
.finding-state button.denied { background: #fff; box-shadow: 0 1px 3px rgba(28,25,46,.1); color: #18785F; }
.finding-state button.present { background: #FCE4E3; box-shadow: 0 1px 3px rgba(121,25,20,.1); color: #B52F2A; }
.ros-symptom-note { grid-column: 1 / -1; padding: 2px 0 6px 24px; }
.system-note { margin-top: 13px; }
.pe-toolbar, .section-intro { align-items: center; display: flex; gap: 14px; justify-content: space-between; }
.pe-toolbar span { color: var(--muted); font-size: 12px; }
.pe-toolbar button { align-items: center; background: #EAF8F3; border: 1px solid #C7EBDD; border-radius: 6px; color: #17765E; cursor: pointer; display: flex; font-size: 11px; font-weight: 750; gap: 5px; padding: 8px 10px; }
.pe-summary-actions { align-items: center; display: flex !important; flex-direction: row !important; gap: 12px !important; }
.pe-summary-actions button { background: transparent; border: 0; color: var(--muted); cursor: pointer; font-size: 10px; font-weight: 700; padding: 5px 7px; }
.pe-summary-actions button:hover { color: var(--ink); }
.pe-groups details[open] .pe-summary-actions > svg { transform: rotate(180deg); }
.pe-findings { background: #fff; padding: 0; }
.pe-finding-row { border-bottom: 1px solid #E8EBEF; padding: 12px 13px; }
.pe-finding-row.is-normal { border-left: 3px solid #50B996; }
.pe-finding-row.is-abnormal { background: #FFF9F8; border-left: 3px solid #D45750; }
.pe-finding-main { align-items: center; display: grid; gap: 14px; grid-template-columns: minmax(210px, 1fr) minmax(210px, 280px); }
.pe-finding-main > span { color: var(--ink); font-size: 12px; font-weight: 650; }
.pe-findings input, .pe-findings select { border: 1px solid #D9DCE1; border-radius: 6px; color: var(--ink); font-size: 12px; min-height: 36px; padding: 8px 9px; width: 100%; }
.pe-finding-main select.is-abnormal { background: #FFF4F3; border-color: #E5A9A5; color: #A92E29; }
.pe-toggle { background: #F1F3F5; border-radius: 7px; display: grid; gap: 3px; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 3px; }
.pe-toggle button { background: transparent; border: 0; border-radius: 5px; color: var(--subtle); cursor: pointer; font-size: 11px; font-weight: 750; min-height: 31px; padding: 6px 9px; }
.pe-toggle button.active { background: #fff; box-shadow: 0 1px 3px rgba(28,25,46,.12); }
.pe-toggle button.active.tone-normal { background: #E5F7F0; color: #17765E; }
.pe-toggle button.active.tone-abnormal { background: #FCE7E5; color: #B52F2A; }
.pe-detail-options { background: #F7F8FA; border: 1px solid #E6E9ED; border-radius: 7px; margin: 10px 0 0 28px; padding: 11px 12px 12px; }
.pe-detail-options > small { color: var(--subtle); display: block; font-size: 9px; font-weight: 800; letter-spacing: .05em; margin-bottom: 8px; text-transform: uppercase; }
.pe-child-list, .pe-joint-grid { display: grid; gap: 6px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pe-child-row { align-items: center; background: #fff; border: 1px solid #E1E5E9; border-radius: 6px; display: grid; gap: 9px; grid-template-columns: minmax(110px, 1fr) auto; min-height: 42px; padding: 6px 8px; }
.pe-child-row.is-abnormal { background: #FFF6F5; border-color: #EDC2BF; }
.pe-child-row > span { font-size: 10.5px; line-height: 15px; }
.pe-toggle--child { min-width: 136px; }
.pe-toggle--child button { font-size: 9px; min-height: 27px; padding: 4px 6px; }
.pe-multi-toggle { display: flex; flex-wrap: wrap; gap: 5px; }
.pe-multi-toggle button, .pe-chip-row button { background: #fff; border: 1px solid #D9DCE1; border-radius: 5px; color: var(--muted); cursor: pointer; font-size: 10px; min-height: 29px; padding: 5px 8px; }
.pe-multi-toggle button.active { background: #FCE7E5; border-color: #E4AAA6; color: #B52F2A; font-weight: 750; }
.pe-structured-children { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pe-chip-row { display: flex; flex-wrap: wrap; gap: 5px; }
.pe-chip-row button.active { background: #E8F6F1; border-color: #A9DACB; color: #17765E; font-weight: 750; }
.pe-extras { align-items: flex-end; background: #FBFBFC; border-radius: 7px; display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr) auto; margin: 10px 0 0 28px; padding: 10px 11px; }
.pe-laterality { min-width: 185px; }
.laterality-buttons { background: #EFF1F3; border-radius: 6px; display: grid; gap: 3px; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 3px; }
.laterality-buttons button { background: transparent; border: 0; border-radius: 4px; color: var(--subtle); cursor: pointer; font-size: 10px; font-weight: 750; min-height: 29px; padding: 5px 8px; }
.laterality-buttons button.active { background: #E8F6F1; box-shadow: 0 1px 3px rgba(28,25,46,.1); color: #17765E; }
.device-section { border-top: 1px solid #E8EBEF; display: flex; flex-direction: column; gap: 9px; padding-top: 17px; }
.device-group { border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.device-grid { background: #fff; border-top: 1px solid #E8EBEF; margin: 0; padding: 10px; }
.oxygen-fields { background: #F8F9FA; border-radius: 7px; padding: 11px; }
.diagnostic-panel { border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.diagnostic-panel > header { align-items: center; background: #FBFBFC; display: flex; justify-content: space-between; padding: 11px 12px; }
.diagnostic-panel p, .section-intro p { color: var(--muted); font-size: 9px; margin: 3px 0 0; }
.diagnostic-panel header button { align-items: center; background: #fff; border: 1px solid var(--border); border-radius: 5px; color: var(--muted); display: flex; font-size: 9px; gap: 4px; padding: 6px 8px; }
.diagnostic-panel article { align-items: center; display: grid; gap: 9px; grid-template-columns: 30px 1fr auto auto; padding: 9px 12px; }
.diagnostic-panel article + article { border-top: 1px solid #EEF1F4; }
.diagnostic-panel article > span { align-items: center; border-radius: 5px; display: flex; height: 28px; justify-content: center; width: 28px; }
.lab-icon { background: #E6F3FB; color: #0076A8; }
.image-icon { background: var(--purple-soft); color: var(--purple); }
.diagnostic-panel article div { display: flex; flex-direction: column; gap: 2px; }
.diagnostic-panel article strong { font-size: 10px; }
.diagnostic-panel article small, .diagnostic-panel article time { color: var(--muted); font-size: 8px; }
.diagnostic-panel article em { background: var(--green-soft); border-radius: 999px; color: #218C69; font-size: 8px; font-style: normal; font-weight: 700; padding: 4px 7px; }
.problem-list { gap: 12px; }
.problem-card { border-left: 3px solid var(--purple); }
.medical-decision { background: #FAF8FE; border: 1px solid #E8DFF7; border-radius: 7px; padding: 12px; }
.notes-editor > small { color: var(--subtle); font-size: 9px; }
.screening-list { display: grid; gap: 9px; }
.screening-card { border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.screening-card > header { align-items: center; background: #FBFBFC; display: flex; justify-content: space-between; padding: 10px 12px; }
.screening-card > header > div { display: flex; flex-direction: column; gap: 2px; }
.screening-card strong { font-size: 11px; }
.screening-card small { color: var(--muted); font-size: 9px; }
.screening-card header label { align-items: center; color: var(--muted); display: flex; font-size: 9px; gap: 5px; }
.screening-card header input { accent-color: var(--mint); }
.screening-card > div { align-items: flex-end; display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)) auto; padding: 10px 12px; }
.screening-card > div > button { background: var(--purple-soft); border: 0; border-radius: 5px; color: var(--purple-dark); font-size: 9px; font-weight: 700; padding: 8px 10px; }
.screening-result { background: var(--green-soft); border-radius: 5px; color: #218C69; font-size: 10px; font-weight: 700; padding: 8px 10px; }
.screening-result.caution { background: #FFF8E6; color: #9A6912; }
.screening-fields .form-field--full { grid-column: 1 / -1; }
.cpt-list { display: grid; gap: 8px; }
.cpt-list article { align-items: center; border: 1px solid var(--border); border-radius: 7px; display: grid; gap: 12px; grid-template-columns: 1fr 160px auto; padding: 10px 12px; }
.cpt-list article > label:first-child { align-items: flex-start; display: flex; gap: 9px; }
.cpt-list article > label:first-child input { accent-color: var(--mint); margin-top: 3px; }
.cpt-list article > label:first-child span { display: flex; flex-direction: column; gap: 2px; }
.cpt-list article strong { font-size: 12px; }
.cpt-list article small { color: var(--muted); font-size: 9px; }
.validation-banner { align-items: flex-start; background: #FFF5F4; border: 1px solid #F1C7C4; border-radius: 7px; color: #B92D29; display: flex; gap: 8px; padding: 10px 12px; }
.validation-banner span { display: flex; flex-direction: column; gap: 2px; }
.validation-banner strong { font-size: 11px; }
.validation-banner small { color: #8B5A57; font-size: 9px; line-height: 14px; }
.cpt-catalog { border-top: 1px solid #EEF1F4; padding-top: 15px; }
.cpt-catalog h4 { font-size: 13px; margin: 0 0 9px; }
.cpt-catalog .choice-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cpt-catalog button { align-items: center; background: #fff; border: 1px solid #E0E3E7; border-radius: 7px; color: var(--muted); cursor: pointer; display: flex; gap: 10px; justify-content: space-between; min-height: 62px; padding: 9px 11px; text-align: left; }
.cpt-catalog button > span { display: flex; flex-direction: column; gap: 3px; }
.cpt-catalog button strong { color: var(--ink); font-size: 12px; }
.cpt-catalog button small { font-size: 9px; line-height: 13px; }
.cpt-catalog button.selected { background: var(--green-soft); border-color: #A7DCCF; color: #218C69; }
.manual-editor__actions { align-items: center; background: rgba(251,251,252,.97); border-top: 1px solid var(--border); bottom: 0; display: flex; gap: 8px; justify-content: flex-end; padding: 11px 18px; position: sticky; z-index: 3; }
.manual-editor__actions .button { min-height: 34px; }
.manual-editor--compact .manual-editor__head { background: var(--purple-soft); border-bottom-color: #E5DBFA; padding: 10px 14px; }
.manual-editor--compact .editor-block { padding: 18px; }

@media (max-width: 900px) {
  .vitals-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .social-grid { grid-template-columns: 1fr; }
  .pe-child-list, .pe-joint-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .form-grid, .source-cards, .checkbox-grid, .code-status-grid, .cpt-catalog .choice-list { grid-template-columns: 1fr; }
  .form-field--full { grid-column: auto; }
  .vitals-grid { grid-template-columns: 1fr; }
  .data-grid__head { display: none; }
  .data-grid__row { grid-template-columns: 1fr 1fr 24px; }
  .body-system-row, .pe-finding-main, .pe-extras, .pe-structured-children { grid-template-columns: 1fr; }
  .ros-category-header { align-items: flex-start; flex-direction: column; padding-bottom: 8px; }
  .ros-category-header > .switch-control { margin-left: 12px; }
  .ros-tally { display: none; }
  .finding-state { width: 100%; }
  .finding-state button { flex: 1; justify-content: center; }
  .pe-detail-options, .pe-extras { margin-left: 0; }
  .pe-laterality { min-width: 0; }
  .screening-card > div, .cpt-list article { grid-template-columns: 1fr; }
  .manual-editor__head { align-items: flex-start; flex-direction: column; gap: 7px; }
}
</style>
