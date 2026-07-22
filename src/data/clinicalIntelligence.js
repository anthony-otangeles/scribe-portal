import { reviewSections } from './portalData'

export const autonomyPolicy = {
  version: 'AUTONOMY-1.0',
  autoCompleteAt: 90,
  humanReviewBelow: 75,
  auditSampleRate: 0.05,
  requireEvidenceForOutputs: true,
  blockOnSourceConflict: true,
  blockOnMissingClinicalContext: true,
}

export const agentResponsibilities = [
  { id: 'intake', name: 'Intake & Evidence Agent', responsibility: 'Normalizes the ended encounter and versions every clinical source.', output: 'Evidence graph', icon: 'clipboard' },
  { id: 'medications', name: 'Medication Agent', responsibility: 'Reconciles the active medication list across provider and eMAR evidence.', output: 'Medication truth set', icon: 'pill' },
  { id: 'reasoning', name: 'Clinical Reasoning Agent', responsibility: 'Reviews the evidence and identifies supported diagnoses and treatment decisions.', output: 'Clinical decisions', icon: 'activity' },
  { id: 'documentation', name: 'Documentation Agent', responsibility: 'Completes all encounter sections from the verified clinical evidence.', output: '18-section note', icon: 'edit' },
  { id: 'coding', name: 'Coding Agent', responsibility: 'Generates diagnosis and billing codes from supported clinical decisions.', output: 'ICD-10 and CPT', icon: 'hash' },
  { id: 'quality', name: 'QA & Compliance Agents', responsibility: 'Test evidence coverage, consistency, uncertainty, and policy compliance.', output: 'Review checks', icon: 'shield' },
]

function scoreForEncounter(section, encounter) {
  if (encounter.status === 'Ready' || encounter.status === 'Agents working') return Math.max(section.score, 90)
  if (encounter.status === 'Agent question') return section.id === 'labs' ? 62 : Math.max(section.score, 86)
  if (encounter.status === 'QA flags') {
    if (section.id === 'meds') return 76
    if (section.id === 'ap') return 81
    return Math.max(section.score, 86)
  }
  if (encounter.revision) return section.id === encounter.revision.sectionId ? 76 : Math.max(section.score, 90)
  return section.score
}

function confidenceLabel(score) {
  if (score >= 90) return 'High'
  if (score >= autonomyPolicy.humanReviewBelow) return 'Medium'
  return 'Low'
}

function uniqueSources(facts) {
  return [...new Set(facts.map((fact) => fact.source))]
}

function buildSections(encounter) {
  return reviewSections.map((section) => {
    const score = scoreForEncounter(section, encounter)
    return {
      ...section,
      score,
      confidence: confidenceLabel(score),
      autonomy: score >= autonomyPolicy.autoCompleteAt ? 'auto-completed' : score < autonomyPolicy.humanReviewBelow ? 'human-required' : 'supervised',
      evidenceSources: uniqueSources(section.facts),
    }
  })
}

function buildExceptions(encounter, sections, editedSectionIds) {
  const checks = []

  if (encounter.revision) {
    checks.push({
      key: `provider-revision-${encounter.revision.sectionId}`,
      type: 'provider-revision',
      sectionId: encounter.revision.sectionId,
      sectionLabel: encounter.revision.sectionLabel,
      title: 'Provider revision requested',
      detail: encounter.revision.text,
      source: encounter.revision.requestedBy,
    })
  }

  if (encounter.status === 'QA flags') {
    sections.forEach((section) => section.facts.filter((fact) => fact.flag).forEach((fact, index) => checks.push({
      key: `qa-${section.id}-${index}`,
      type: 'source-conflict',
      sectionId: section.id,
      sectionLabel: section.label,
      title: fact.flag,
      detail: fact.text,
      source: `${fact.source} · ${fact.ref}`,
    })))
  }

  if (encounter.status === 'Agent question') {
    const questionSection = sections.find((section) => section.question)
    if (questionSection) checks.push({
      key: `question-${questionSection.id}`,
      type: 'missing-context',
      sectionId: questionSection.id,
      sectionLabel: questionSection.label,
      title: 'Minimum clinical clarification required',
      detail: questionSection.question,
      source: 'Clinical Reasoning Agent',
    })
  }

  sections.filter((section) => section.score < autonomyPolicy.humanReviewBelow && !checks.some((check) => check.sectionId === section.id)).forEach((section) => checks.push({
    key: `confidence-${section.id}`,
    type: 'low-confidence',
    sectionId: section.id,
    sectionLabel: section.label,
    title: `${section.score}% confidence requires judgment`,
    detail: `The evidence does not meet the ${autonomyPolicy.humanReviewBelow}% autonomous-completion threshold.`,
    source: 'Autonomy Policy',
  }))

  return checks.map((check) => ({ ...check, resolved: editedSectionIds.includes(check.sectionId) }))
}

function buildDecisions(sections) {
  const section = (id) => sections.find((item) => item.id === id)
  const evidence = (...ids) => ids.flatMap((id) => section(id)?.facts || [])

  return [
    {
      id: 'decision-hypertension',
      type: 'Diagnosis & treatment',
      title: 'Essential hypertension remains above goal',
      conclusion: 'Continue lisinopril 20 mg daily and record blood pressure daily for seven days.',
      confidence: section('ap').score,
      sectionId: 'ap',
      outputs: ['ICD-10 I10', 'Assessment & Plan', 'Daily BP monitoring order'],
      evidence: evidence('vitals', 'ap'),
    },
    {
      id: 'decision-edema',
      type: 'Clinical decision',
      title: 'Peripheral edema requires medication reconciliation',
      conclusion: 'Verify the active furosemide dose before changing therapy; escalate worsening cardiopulmonary symptoms.',
      confidence: Math.min(section('meds').score, section('ap').score),
      sectionId: 'meds',
      outputs: ['ICD-10 R60.0', 'Medication plan', 'Provider escalation guidance'],
      evidence: evidence('hpi', 'meds', 'pe', 'ap'),
    },
    {
      id: 'decision-coding',
      type: 'Coding & billing',
      title: 'Moderate-complexity subsequent nursing-facility care',
      conclusion: 'The documented problems and prescription management support CPT 99309.',
      confidence: section('cpt').score,
      sectionId: 'cpt',
      outputs: ['CPT 99309', 'Billing summary'],
      evidence: evidence('ap', 'cpt'),
    },
  ].map((decision) => ({ ...decision, sources: uniqueSources(decision.evidence) }))
}

export function buildClinicalIntelligence(encounter, editedSectionIds = [], feedback = []) {
  const sections = buildSections(encounter)
  const exceptions = buildExceptions(encounter, sections, editedSectionIds)
  const decisions = buildDecisions(sections)
  const feedbackForEncounter = feedback.filter((item) => item.encounterId === encounter.id)
  const averageConfidence = Math.round(sections.reduce((total, section) => total + section.score, 0) / sections.length)

  return {
    model: {
      id: `clinical-understanding:${encounter.id}`,
      version: 'CLINICAL-UNDERSTANDING-3.2',
      evidenceCount: sections.reduce((total, section) => total + section.facts.length, 0),
      generatedOutputs: sections.length + decisions.reduce((total, decision) => total + decision.outputs.length, 0),
    },
    policy: autonomyPolicy,
    sections,
    decisions,
    exceptions,
    reviewChecks: [
      ...exceptions,
      { key: 'source-completeness', title: 'Source completeness', detail: 'All required encounter sources are synced, versioned, and linked to the evidence graph.', source: 'Intake & Evidence Agent', resolved: true },
      { key: 'cross-output-consistency', title: 'Cross-output consistency', detail: 'Diagnoses, treatment plans, encounter sections, orders, and codes agree with one another.', source: 'QA Agent', resolved: true },
      { key: 'coding-compliance', title: 'Coding and compliance', detail: 'Clinical evidence supports the generated diagnosis and billing codes.', source: 'Coding + Compliance Agents', resolved: true },
    ],
    agents: agentResponsibilities,
    feedback: feedbackForEncounter,
    averageConfidence,
    autonomy: exceptions.some((check) => !check.resolved)
      ? { level: 'Human judgment required', tone: 'attention', detail: 'Only surfaced exceptions require intervention.' }
      : { level: 'AI-completed', tone: 'autonomous', detail: 'No blocking exceptions; eligible for provider handoff.' },
  }
}
