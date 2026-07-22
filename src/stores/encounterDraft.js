import { reactive } from 'vue'
import { createEditorState } from '../data/editorData'

export const encounterDraft = reactive(createEditorState())

const workflowStorageKey = 'otangeles-scribe-workflow-v1'

function loadWorkflowState() {
  if (typeof window === 'undefined') return { editedSections: {}, correctionFeedback: [], sentEncounters: {}, clarificationRequests: {}, createdEncounters: [] }
  try {
    const stored = window.localStorage.getItem(workflowStorageKey)
    const parsed = stored ? JSON.parse(stored) : {}
    return {
      editedSections: parsed.editedSections && typeof parsed.editedSections === 'object' ? parsed.editedSections : {},
      correctionFeedback: Array.isArray(parsed.correctionFeedback) ? parsed.correctionFeedback : [],
      sentEncounters: parsed.sentEncounters && typeof parsed.sentEncounters === 'object' ? parsed.sentEncounters : {},
      clarificationRequests: parsed.clarificationRequests && typeof parsed.clarificationRequests === 'object' ? parsed.clarificationRequests : {},
      createdEncounters: Array.isArray(parsed.createdEncounters) ? parsed.createdEncounters : [],
    }
  } catch {
    return { editedSections: {}, correctionFeedback: [], sentEncounters: {}, clarificationRequests: {}, createdEncounters: [] }
  }
}

function persistWorkflowState() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(workflowStorageKey, JSON.stringify(encounterWorkflowState))
  } catch {
    // The prototype remains usable when browser storage is unavailable.
  }
}

export const encounterWorkflowState = reactive(loadWorkflowState())

export function updateEncounterSection(sectionId, value) {
  encounterDraft[sectionId] = JSON.parse(JSON.stringify(value))
}

export function recordEncounterSectionEdit(encounterId, sectionId, correction = null) {
  const edited = encounterWorkflowState.editedSections[encounterId] || []
  if (!edited.includes(sectionId)) {
    encounterWorkflowState.editedSections[encounterId] = [...edited, sectionId]
  }
  if (correction) {
    encounterWorkflowState.correctionFeedback.push({
      id: `${encounterId}:${sectionId}:${Date.now()}`,
      encounterId,
      sectionId,
      actor: 'Assigned Scribe',
      capturedAt: new Date().toISOString(),
      modelVersion: 'CLINICAL-UNDERSTANDING-3.2',
      ...JSON.parse(JSON.stringify(correction)),
    })
  }
  persistWorkflowState()
}

export function wasEncounterSectionEdited(encounterId, sectionId) {
  return encounterWorkflowState.editedSections[encounterId]?.includes(sectionId) || false
}

export function recordEncounterSent(encounterId, provider) {
  encounterWorkflowState.sentEncounters[encounterId] = {
    provider,
    sentAt: new Date().toISOString(),
    actor: 'Assigned Scribe',
    state: 'Delivered',
  }
  persistWorkflowState()
}

export function recordCreatedEncounter(encounter) {
  const created = JSON.parse(JSON.stringify(encounter))
  encounterWorkflowState.createdEncounters = [created, ...(encounterWorkflowState.createdEncounters || [])]
  persistWorkflowState()
}

export function recordClarificationRequest(encounterId, request) {
  encounterWorkflowState.clarificationRequests[encounterId] = {
    id: `${encounterId}:clarification:${Date.now()}`,
    encounterId,
    sectionId: request.sectionId,
    sectionLabel: request.sectionLabel,
    question: request.question.trim(),
    provider: request.provider,
    medicalPractice: request.medicalPractice,
    facility: request.facility,
    status: 'awaiting-provider',
    routedVia: 'Otangeles Operations',
    submittedBy: 'Assigned Scribe',
    submittedAt: new Date().toISOString(),
    response: '',
    respondedAt: null,
    respondedBy: null,
  }
  persistWorkflowState()
}

export function recordClarificationResponse(encounterId, response, respondedBy = 'Otangeles Operations') {
  const request = encounterWorkflowState.clarificationRequests[encounterId]
  if (!request) return
  encounterWorkflowState.clarificationRequests[encounterId] = {
    ...request,
    status: 'answered',
    response: response.trim(),
    respondedAt: new Date().toISOString(),
    respondedBy,
  }
  persistWorkflowState()
}
