export const codeStatusOptions = [
  ['Full Code', 'All life-sustaining measures are permitted, including CPR, intubation, defibrillation, and advanced life support.'],
  ['DNR (Do Not Resuscitate)', 'No CPR is performed if the resident experiences cardiac or respiratory arrest.'],
  ['DNI (Do Not Intubate)', 'Endotracheal intubation and mechanical ventilation are not permitted; other treatments may be provided.'],
  ['DNR / DNI', 'Neither CPR nor intubation is performed in the event of cardiac or respiratory arrest.'],
  ['Limited Interventions', 'Selected medical treatments are allowed, but no CPR, intubation, or intensive life-sustaining measures.'],
  ['Selective Treatment', 'Hospital transfer and medical treatment are permitted; ICU-level care and aggressive life support are avoided.'],
  ['Comfort Measures Only (CMO)', 'Care is focused exclusively on comfort and symptom relief; no life-prolonging treatments are provided.'],
  ['DNR - Comfort Care Arrest (DNR-CCA)', 'Full medical treatment is provided until cardiac or respiratory arrest occurs; no CPR is performed after arrest.'],
  ['DNR - Comfort Care Only (DNR-CC)', 'Only comfort-focused care is provided at all times; no resuscitative or life-prolonging interventions are used.'],
  ['Allow Natural Death (AND)', 'Natural death is allowed without resuscitative efforts using patient-centered language.'],
  ['Hospice / Palliative Focus', 'Care emphasizes symptom control and quality of life, aligned with comfort-focused goals.'],
  ['Unknown / Pending Documentation', 'Code status has not yet been confirmed and requires prompt clarification.'],
]

export const socialHistoryGroups = [
  { key: 'alcoholUse', label: 'Alcohol Use', required: true, options: ['Never', 'Former', 'Social / Occasional', 'Current', 'Unknown'], detailsOn: ['Social / Occasional', 'Current'], detailLabel: 'Frequency' },
  { key: 'drugUse', label: 'Drug / Substance Use', required: true, options: ['Never', 'Former (Remote)', 'Recreational', 'Current', 'Unknown'], detailsOn: ['Recreational', 'Current'], detailLabel: 'Additional details' },
  { key: 'tobaccoUse', label: 'Tobacco / Nicotine Use', required: true, options: ['Never', 'Former', 'Current', 'Unknown'], detailsOn: ['Current'], detailLabel: 'Frequency' },
  { key: 'vapingUse', label: 'Vaping Use', options: ['Never', 'Former', 'Current', 'Unknown'], detailsOn: ['Current'], detailLabel: 'Frequency' },
  { key: 'dwellingType', label: 'Dwelling Type', options: ['Single-story home', 'Multi-story home', 'Apartment', 'Mobile home', 'Other', 'Unknown'], detailsOn: ['Other'], detailLabel: 'Dwelling details' },
  { key: 'maritalStatus', label: 'Marital Status', required: true, options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated', 'Unknown'] },
  { key: 'sexualActivity', label: 'Sexual Activity', options: ['Not currently sexually active', 'Sexually active', 'Unknown'] },
  { key: 'socialSupport', label: 'Social Support', options: ['Strong family support', 'Limited support', 'No reliable support', 'Unknown'] },
]

export const pmhConditionGroups = [
  { label: 'Cardiovascular', options: ['Hypertension', 'Hyperlipidemia', 'Coronary artery disease', 'Heart failure', 'Atrial fibrillation', 'Myocardial infarction', 'Stroke', 'Transient ischemic attack (TIA)', 'Peripheral artery disease', 'Aortic aneurysm'] },
  { label: 'Endocrine', options: ['Type 1 diabetes mellitus', 'Type 2 diabetes mellitus', 'Hypothyroidism', 'Hyperthyroidism', 'Thyroid nodules'] },
  { label: 'Pulmonary', options: ['Asthma', 'Chronic obstructive pulmonary disease (COPD)', 'Interstitial lung disease', 'Sleep apnea', 'Pulmonary hypertension', 'Emphysema'] },
  { label: 'Gastrointestinal', options: ['Gastroesophageal reflux disease (GERD)', 'Peptic ulcer disease', 'Inflammatory bowel disease', 'Celiac disease', 'Irritable bowel syndrome', 'Pancreatitis', 'Hepatitis', 'Cirrhosis'] },
  { label: 'Renal / Genitourinary', options: ['Chronic kidney disease', 'End-stage renal disease', 'Benign prostatic hyperplasia', 'Urinary incontinence', 'Recurrent urinary tract infections'] },
  { label: 'Neurological', options: ['Parkinson disease', 'Alzheimer disease', 'Multiple sclerosis', 'Seizure disorder', 'Migraine headaches', 'Neuropathy'] },
  { label: 'Psychiatric', options: ['Depression', 'Anxiety disorder', 'Bipolar disorder', 'Schizophrenia', 'Post-traumatic stress disorder (PTSD)', 'Substance use disorder'] },
  { label: 'Rheumatologic / Immunologic', options: ['Rheumatoid arthritis', 'Osteoarthritis', 'Systemic lupus erythematosus', 'Gout', 'HIV/AIDS', 'Hepatitis B', 'Hepatitis C'] },
  { label: 'Cancer', options: ['Breast cancer', 'Lung cancer', 'Colorectal cancer', 'Prostate cancer', 'Ovarian cancer', 'Lymphoma', 'Melanoma'] },
]

export const familyConditionOptions = ['Heart disease', 'Diabetes', 'Cancer', 'Stroke', 'Hypertension', 'Asthma', 'Mental Illness', 'Kidney disease', 'Thyroid disease']
export const cancerSubtypeOptions = ['Colon', 'Breast', 'Prostate', 'Lung', 'Skin', 'Ovarian', 'Cervical']

export const immunizationOptions = ['Influenza', 'COVID-19', 'Pneumococcal (PCV)', 'Pneumococcal (PPSV23)', 'Td/Tdap', 'Shingles', 'RSV', 'Hepatitis B', 'Hepatitis A', 'MMR', 'Varicella', 'Tuberculosis', 'Hib', 'Meningococcal', 'Polio', 'HPV', 'Typhoid', 'Yellow fever', 'Rabies', 'Smallpox']

export const rosGroups = [
  { id: 'general', name: 'General', symptoms: ['Excessive daytime sleepiness', 'Fever', 'Trouble staying asleep', 'Weight gain', 'Malaise', 'Fatigue', 'Low energy', 'Trouble getting to sleep', 'Weight loss'] },
  { id: 'eyes', name: 'Eyes', symptoms: ['Discharge', 'Eye Pain', 'Photophobia', 'Itching', 'Eye Redness', 'Visual Disturbance'] },
  { id: 'respiratory', name: 'Respiratory', symptoms: ['Apnea', 'Shortness of Breath', 'Wheezing', 'Cough', 'Stridor'] },
  { id: 'enmt', name: 'Ears/Nose/Mouth/Tongue', symptoms: ['Congestion', 'Drooling', 'Ear Pain', 'Difficulty Swallowing', 'Dental Problems', 'Ear Discharge', 'Facial Swelling'] },
  { id: 'cardiovascular', name: 'Cardiovascular', symptoms: ['Chest Pain', 'Palpitations', 'Temperature Changes to Distal Extremities', 'Chest Tightness', 'Color Changes to Distal Extremities', 'Swelling'] },
  { id: 'gastrointestinal', name: 'Gastrointestinal', symptoms: ['Constipation', 'Heartburn', 'Vomiting', 'Diarrhea', 'Nausea', 'Abdominal Pain'] },
  { id: 'genitourinary', name: 'Genitourinary', symptoms: ['Dysuria', 'Urinary frequency', 'Nocturia', 'Urinary urgency', 'Hesitancy', 'Oliguria / decreased urine output', 'Urinary incontinence', 'Flank pain', 'Suprapubic pain', 'Genitourinary discharge'] },
  { id: 'musculoskeletal', name: 'Musculoskeletal', symptoms: ['Back Pain', 'Muscle Pain or Cramps', 'Joint Pain or Swelling', 'Neck Pain'] },
  { id: 'neurological', name: 'Neurological', symptoms: ['Confusion', 'Falls', 'Tingling', 'Spinning or Vertigo', 'Seizures', 'Headaches', 'Numbness', 'Tremors', 'Weakness'] },
  { id: 'skin', name: 'Skin', symptoms: ['Changes in hair or nails', 'Swelling', 'Bruises', 'Mass', 'Changes in skin color', 'Itching', 'Rash', 'Open lesions'] },
  { id: 'breast', name: 'Breast', symptoms: ['Swelling', 'Bruises', 'Mass', 'Changes in skin color', 'Itching', 'Rash', 'Open lesions'] },
  { id: 'psychiatric', name: 'Psychiatric', symptoms: ['Depressed mood', 'Memory Loss', 'Anxiety', 'Hallucinations', 'Insomnia', 'Agitation'] },
  { id: 'endocrine', name: 'Endocrine', symptoms: ['Heat or Cold Intolerance', 'Loss of Hair', 'Increased Thirst', 'Nocturia'] },
  { id: 'hematological-lymphatic', name: 'Hematological/Lymphatic', symptoms: ['Anemia', 'Slow to heal after cuts', 'Bruising'] },
  { id: 'allergic-immunologic', name: 'Allergic/Immunologic', symptoms: ['Rash'] },
]

// These controls mirror the original Encounter Editor. The metadata is kept next
// to the catalog so every PE finding can use its own interaction instead of a
// generic dropdown.
const peFindingEnhancements = {
  Awake: { toggleStyle: 'awake-not-awake' },
  Alert: { toggleStyle: 'alert-not-alert' },
  'Oxygen use': { toggleStyle: 'yes-no', detailPlaceholder: 'Device + flow rate (e.g., NC 2 L/min)', detailShowWhen: 'positive' },
  'General Appearance': {
    options: ['Well Appearing', 'Ill Appearing', 'Toxic Appearing', 'Frail', 'Distressed', 'No Acute Distress', 'Weight', 'Other'],
    normalOptions: ['Well Appearing', 'No Acute Distress', 'Weight'],
    detailOptions: ['Normal Weight', 'Overweight', 'Obese', 'Morbidly Obese'],
    childrenForSelections: ['Weight'],
    detailMode: 'single-select',
    detailPlaceholder: 'Specify appearance or other details (optional)',
    detailShowWhen: 'abnormal',
  },
  'Comfort status': { options: ['Comfortable', 'Anxious', 'In pain', 'Acute distress'], normalOptions: ['Comfortable'] },
  'Nose appearance': { toggleStyle: 'normal-abnormal' },
  'External ear appearance': { toggleStyle: 'normal-abnormal', detailPlaceholder: 'Add details...', detailShowWhen: 'abnormal', lateralityEnabled: true, lateralityShowWhen: 'abnormal' },
  'Oropharynx status': { toggleStyle: 'normal-abnormal', detailOptions: ['Oropharyngeal exudates', 'Oral lesions', 'Fluid behind TM'], childrenShowWhen: 'abnormal' },
  'Hearing device': { toggleStyle: 'yes-no', detailPlaceholder: 'Device type', detailShowWhen: 'positive', lateralityEnabled: true, lateralityShowWhen: 'positive' },
  'Head Normocephalic': { toggleStyle: 'yes-no' },
  'Conjunctiva normal': { toggleStyle: 'normal-abnormal', detailOptions: ['Discharge', 'Erythema', 'Icterus'], childrenShowWhen: 'abnormal', detailPlaceholder: 'Other details', detailShowWhen: 'abnormal' },
  'EOM (Extraocular Movements Intact)': { toggleStyle: 'intact-not-intact' },
  'Eye discharge': { detailPlaceholder: 'Details', detailShowWhen: 'positive', lateralityEnabled: true, lateralityShowWhen: 'positive' },
  'Eye swelling': { detailPlaceholder: 'Details', detailShowWhen: 'positive', lateralityEnabled: true, lateralityShowWhen: 'positive' },
  PERRLA: { toggleStyle: 'yes-no' },
  'Vision grossly intact': { toggleStyle: 'yes-no', detailPlaceholder: 'Details', detailShowWhen: 'abnormal' },
  'Uses eyeglasses': { toggleStyle: 'yes-no' },
  Adenopathy: { detailOptions: ['Cervical adenopathy', 'Supraclavicular adenopathy'], childrenShowWhen: 'abnormal' },
  'Normal rate': { toggleStyle: 'normal-abnormal', detailOptions: ['Tachycardia', 'Bradycardia'], childrenShowWhen: 'abnormal' },
  'Heart sounds': { toggleStyle: 'normal-abnormal', detailOptions: ['Murmur', 'Rub', 'Gallop', 'Click'], childrenShowWhen: 'abnormal' },
  'Cardiac rhythm': { toggleStyle: 'regular-irregular' },
  Edema: { detailOptions: ['Pitting', 'Non-pitting', 'Edema in lower extremities'], childrenShowWhen: 'positive', lateralityEnabled: true, lateralityShowWhen: 'positive' },
  'Chest appearance': { toggleStyle: 'normal-abnormal' },
  'Chest movement': { toggleStyle: 'normal-abnormal' },
  'CTA (Clear to Auscultation)': { detailOptions: ['Left CTA', 'Right CTA', 'Diminished', 'Wheezes', 'Rhonchi', 'Rales', 'Crackles'], normalChildren: ['Left CTA', 'Right CTA'], childrenShowWhen: 'negative' },
  'Soft abdomen': { toggleStyle: 'yes-no' },
  'Bowel sounds': { toggleStyle: 'normal-abnormal', detailOptions: ['Hyperactive', 'Hypoactive', 'Absent'], childrenShowWhen: 'abnormal' },
  Tenderness: { detailOptions: ['Guarding', 'Rebound tenderness'], childrenShowWhen: 'positive' },
  Ostomy: { detailOptions: ['PEG tube', 'Colostomy'], childrenShowWhen: 'positive' },
  Hernia: { detailPlaceholder: 'Location / type (e.g., right inguinal)', detailShowWhen: 'positive' },
  'Urinary catheter': { detailOptions: ['Suprapubic', 'Foley'], childrenShowWhen: 'positive' },
  Posture: { options: ['Normal', 'Kyphosis', 'Scoliosis', 'Lordosis'], normalOptions: ['Normal'] },
  'Range of Motion (ROM)': { options: ['Full', 'Mildly limited', 'Moderately limited', 'Severely limited', 'Unable'], normalOptions: ['Full'] },
  'Muscle tone': { toggleStyle: 'normal-abnormal', detailOptions: ['Increased', 'Decreased'], childrenShowWhen: 'abnormal', detailMode: 'single-toggle' },
  Gait: { toggleStyle: 'normal-abnormal', detailOptions: ['Antalgic', 'Limping', 'Trendelenburg', 'Unable to ambulate (uses wheelchair, walker for assistance etc.)'], childrenShowWhen: 'abnormal' },
  'Lower extremity appearance': { toggleStyle: 'normal-amputated', detailPlaceholder: 'Describe type of amputation', detailShowWhen: 'abnormal' },
  'Joint pain or swelling': { detailOptions: ['Shoulder — pain', 'Shoulder — swelling', 'Hip — pain', 'Hip — swelling', 'Knee — pain', 'Knee — swelling', 'Ankle — pain', 'Ankle — swelling', 'Toes — pain', 'Toes — swelling', 'Hands/wrist — pain', 'Hands/wrist — swelling'], childrenShowWhen: 'positive', detailMode: 'joint-multi' },
  'Upper extremity strength': { toggleStyle: 'equal-not-equal', detailPlaceholder: 'Add details...', detailShowWhen: 'abnormal', lateralityEnabled: true, lateralityShowWhen: 'abnormal' },
  'Lower extremity strength': { toggleStyle: 'equal-not-equal', detailPlaceholder: 'Add details...', detailShowWhen: 'abnormal', lateralityEnabled: true, lateralityShowWhen: 'abnormal' },
  Texture: { options: ['Normal', 'Dry', 'Scaly', 'Thickened', 'Atrophic'], normalOptions: ['Normal'] },
  'Skin color': { toggleStyle: 'normal-abnormal', detailOptions: ['Erythematous', 'Hyperpigmented', 'Hypopigmented', 'Pale', 'Jaundiced'], childrenShowWhen: 'abnormal' },
  Ulcers: { detailOptions: ['Pressure ulcer', 'Non pressure ulcer'], childrenShowWhen: 'positive', detailPlaceholder: 'Add notes about the selected ulcer', detailShowWhen: 'positive' },
  Rash: { detailOptions: ['Macule', 'Papule', 'Plaque', 'Nodule', 'Vesicle', 'Bulla', 'Pustule', 'Wheal', 'Patch', 'Petechiae/purpura'], childrenShowWhen: 'positive' },
  'Mental status': {
    toggleStyle: 'normal-abnormal',
    childrenShowWhen: 'abnormal',
    detailMode: 'mental-status',
    childGroups: [
      { name: 'Orientation', type: 'chips', options: ['Person', 'Place', 'Time', 'Situation'] },
      { name: 'Level of Consciousness', type: 'select', options: ['Alert', 'Lethargic', 'Obtunded', 'Stuporous', 'Comatose'] },
      { name: 'Speech', type: 'select', options: ['Normal', 'Slurred', 'Aphasic', 'Dysarthric'] },
      { name: 'Cognition', type: 'chips', options: ['Normal', 'Confused', 'Memory deficit', 'Delirium'] },
    ],
  },
  Reflexes: { toggleStyle: 'normal-abnormal', detailOptions: ['Hyperreflexic', 'Hyporeflexic', 'Areflexic'], childrenShowWhen: 'abnormal', detailMode: 'single-select' },
  Coordination: { toggleStyle: 'normal-abnormal', detailOptions: ['Dysmetria', 'Ataxia', 'Tremor'], childrenShowWhen: 'abnormal', detailMode: 'single-select' },
  'Focal weakness': { detailPlaceholder: 'Add details...', detailShowWhen: 'abnormal', lateralityEnabled: true, lateralityShowWhen: 'abnormal' },
  'Mood and affect': { options: ['Normal', 'Depressed', 'Anxious', 'Euphoric', 'Irritable', 'Flat Affect', 'Labile', 'Tearful', 'Blunted', 'Other'], normalOptions: ['Normal'], detailPlaceholder: 'Describe mood/affect', detailShowWhen: 'other' },
  'Cooperative': { toggleStyle: 'yes-no' },
  'Psychosis symptoms': { detailPlaceholder: 'Add details...', detailShowWhen: 'abnormal' },
}

const normalWhenPresent = new Set([
  'Awake', 'Alert', 'General Appearance', 'Comfort status', 'Nose appearance', 'External ear appearance', 'Oropharynx status',
  'Head Normocephalic', 'Conjunctiva normal', 'EOM (Extraocular Movements Intact)', 'PERRLA', 'Vision grossly intact',
  'Range of Motion (ROM) at baseline', 'Supple (Flexible/normal movement)', 'Normal rate', 'Heart sounds', 'Cardiac rhythm',
  'Intact distal pulses', 'Chest appearance', 'Chest movement', 'CTA (Clear to Auscultation)', 'Soft abdomen', 'Bowel sounds',
  'Posture', 'Range of Motion (ROM)', 'Muscle tone', 'Gait', 'Lower extremity appearance', 'Upper extremity strength',
  'Lower extremity strength', 'Texture', 'Skin color', 'Mental status', 'Reflexes', 'Coordination',
  'Cranial nerves grossly intact', 'Sensory grossly intact', 'Motor function intact', 'Cooperative', 'Mood and affect',
])

const negativeInitialValues = new Set(['Absent', 'No', 'Not Alert', 'Not Awake', 'Not Intact', 'Not equal', 'Irregular', 'Abnormal', 'Amputated', 'Unsteady'])

const peGroup = (id, name, findings) => ({
  id,
  name,
  findings: findings.map(([findingName, suppliedValue]) => {
    const enhancement = peFindingEnhancements[findingName] || {}
    const polarity = normalWhenPresent.has(findingName) ? 'normal_when_present' : 'abnormal_when_present'
    const inputType = enhancement.options ? 'select' : 'toggle'
    let value = suppliedValue
    if (inputType === 'select' && !enhancement.options.includes(value)) value = enhancement.normalOptions?.[0] || enhancement.options[0]
    if (inputType === 'toggle' && value == null) value = polarity === 'normal_when_present' ? 'Present' : 'Absent'
    const state = negativeInitialValues.has(value) ? 'negative' : 'positive'

    return {
      name: findingName,
      value,
      state,
      polarity,
      inputType,
      detail: '',
      selectedDetails: [],
      detailStates: Object.fromEntries((enhancement.detailOptions || []).map((item) => [item, 'unset'])),
      childSelections: Object.fromEntries((enhancement.childGroups || []).map((group) => [group.name, group.type === 'chips' ? [] : ''])),
      laterality: '',
      ...enhancement,
    }
  }),
})

export const physicalExamGroups = [
  peGroup('general', 'General', [['Awake', 'Present'], ['Alert', 'Present'], ['Oxygen use', 'Absent'], ['General Appearance', 'Well Appearing'], ['Comfort status', 'Comfortable']]),
  peGroup('enmt', 'Ears/Nose/Mouth/Throat', [['Nose appearance'], ['External ear appearance'], ['Oropharynx status'], ['Nasal drainage', 'Absent'], ['Hearing problem', 'Absent'], ['Hearing device', 'Absent'], ['Head Normocephalic', 'Present']]),
  peGroup('eyes', 'Eyes', [['Conjunctiva normal'], ['EOM (Extraocular Movements Intact)', 'Intact'], ['Eye discharge', 'Absent'], ['Eye swelling', 'Absent'], ['PERRLA', 'Present'], ['Vision grossly intact', 'Present'], ['Uses eyeglasses', 'Present']]),
  peGroup('neck', 'Neck', [['Range of Motion (ROM) at baseline', 'Present'], ['Supple (Flexible/normal movement)', 'Present'], ['JVD (Jugular Venous Distention)', 'Absent'], ['Thyromegaly, tracheal deviation', 'Absent'], ['Adenopathy', 'Absent']]),
  peGroup('cardiovascular', 'Cardiovascular', [['Normal rate'], ['Heart sounds'], ['Cardiac rhythm', 'Regular'], ['Intact distal pulses', 'Present'], ['Edema', 'Present'], ['Cardiac pacemaker', 'Absent']]),
  peGroup('respiratory', 'Respiratory', [['Chest appearance'], ['Chest movement'], ['CTA (Clear to Auscultation)', 'Present'], ['Respiratory distress', 'Absent']]),
  peGroup('gastrointestinal', 'Gastrointestinal', [['Soft abdomen', 'Present'], ['Bowel sounds'], ['Tenderness', 'Absent'], ['Distension', 'Absent'], ['Mass', 'Absent'], ['Ostomy', 'Absent']]),
  peGroup('genitourinary', 'Genitourinary', [['Discharge', 'Absent'], ['Hernia', 'Absent'], ['Urinary catheter', 'Absent'], ['Suprapubic tenderness', 'Absent'], ['CVA tenderness', 'Absent'], ['Hematuria', 'Absent'], ['Dysuria', 'Absent']]),
  peGroup('musculoskeletal', 'Musculoskeletal', [['Posture'], ['Range of Motion (ROM)', 'Full'], ['Muscle tone'], ['Gait', 'Abnormal'], ['Lower extremity appearance'], ['Contractures', 'Absent'], ['Joint pain or swelling', 'Absent'], ['Upper extremity strength'], ['Lower extremity strength']]),
  peGroup('skin', 'Skin', [['Texture'], ['Skin color'], ['Ulcers', 'Absent'], ['Bruising', 'Absent'], ['Rash', 'Absent']]),
  peGroup('neurologic', 'Neurologic', [['Mental status', 'Alert'], ['Reflexes'], ['Coordination'], ['Cranial nerves grossly intact', 'Present'], ['Sensory grossly intact', 'Present'], ['Motor function intact', 'Present'], ['Focal weakness', 'Present'], ['Numbness or tingling', 'Absent']]),
  peGroup('behavior-psychiatric', 'Behavior/Psychiatric', [['Cooperative', 'Present'], ['Mood and affect'], ['Psychosis symptoms', 'Absent'], ['Suicidal or homicidal ideation', 'Absent']]),
]

export const peDeviceGroups = [
  { name: 'Vision / Hearing & Accessibility', items: ['Amplified Device', 'Hearing Aid - Left', 'Hearing Aid - Right', 'TTY/TDD/Relay Equipment', 'Braille', 'Interpreter Needed - Foreign Language', 'Interpreter Needed - Sign Language', 'Contact Lenses', 'Glasses', 'Reading Only', 'Magnifying Glass'] },
  { name: 'Mobility & Prosthetics', items: ['Cane/Crutch', 'Electric Wheelchair', 'Manual Wheelchair', 'Walker', 'Dental Appliance - Upper Partial', 'Dental Appliance - Upper Full', 'Dental Appliance - Lower Partial', 'Dental Appliance - Lower Full'] },
  { name: 'Urinary / Bowel & Nutrition', items: ['Bladder (Foley) Catheter', 'Condom Catheter', 'Urostomy', 'External Catheter', 'Suprapubic Catheter', 'Urinary Toileting Program', 'Ostomy', 'Ileostomy', 'Colostomy', 'Bowel Toileting Program', 'Hemodialysis', 'Peritoneal Dialysis', 'Dialysis Shunt', 'Drains', 'Enteral Feeding'] },
  { name: 'Respiratory & Advanced Devices', items: ['Nebulizer Therapy', 'O2 Therapy', 'BiPAP', 'CPAP', 'Ventilator', 'Suction', 'Tracheostomy', 'Internal Defibrillator', 'LifeVest', 'Pacemaker', 'PICC Line', 'IV Medication', 'Parenteral/IV Feedings', 'Chest Tube', 'TPN', 'Cancer Treatments'] },
]

export const cptCatalog = [
  ['99304', 'Initial nursing facility care — low medical decision making; 25 minutes.'], ['99305', 'Initial nursing facility care — moderate medical decision making; 35 minutes.'], ['99306', 'Initial nursing facility care — high medical decision making; 45 minutes.'],
  ['99307', 'Subsequent nursing facility care — straightforward medical decision making; 10 minutes.'], ['99308', 'Subsequent nursing facility care — low medical decision making; 15 minutes.'], ['99309', 'Subsequent nursing facility care — moderate medical decision making; 30 minutes.'], ['99310', 'Subsequent nursing facility care — high medical decision making; 45 minutes.'],
  ['99315', 'Nursing facility discharge management; 30 minutes or less.'], ['99316', 'Nursing facility discharge management; more than 30 minutes.'], ['G0317', 'Prolonged nursing facility E/M add-on; each additional 15 minutes.'],
  ['99495', 'Transitional care management — moderate complexity.'], ['99496', 'Transitional care management — high complexity.'], ['99497', 'Advance care planning; first 16–45 minutes.'], ['99498', 'Advance care planning; each additional 30 minutes.'],
  ['99483', 'Cognitive assessment and care planning.'], ['99490', 'Chronic care management; first 20 minutes.'], ['99406', 'Tobacco cessation counseling; 3–10 minutes.'], ['99407', 'Tobacco cessation counseling; more than 10 minutes.'], ['69209', 'Removal of impacted cerumen by irrigation.'], ['69210', 'Removal of impacted cerumen requiring instrumentation.'],
]
