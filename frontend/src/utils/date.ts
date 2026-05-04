export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

export function toDateTimeLocalValue(iso: string) {
  return iso.slice(0, 16)
}
