export function formatPatientName(patient, sex = '') {
  const parts = String(patient || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const lastName = parts.length > 1 ? parts.at(-1) : parts[0]
  const firstNames = parts.length > 1 ? parts.slice(0, -1).join(' ') : ''
  const formattedName = firstNames ? `${lastName}, ${firstNames}` : lastName
  const sexInitial = String(sex || '').trim().charAt(0).toUpperCase()
  return `${formattedName.toUpperCase()}${sexInitial ? ` (${sexInitial})` : ''}`
}
