export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** "2026-02-05" -> "05/02/2026" */
export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Mostra só o meio do CPF: ***.482.917-** */
export function maskCpf(cpf = '') {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf || '—'
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

/** Aplica a máscara 000.000.000-00 enquanto digita */
export function formatCpfInput(value = '') {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/** Aplica a máscara (11) 90000-0000 enquanto digita */
export function formatPhoneInput(value = '') {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function formatNota(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return Number(valor).toFixed(1).replace('.', ',')
}

export function formatNumber(n) {
  return new Intl.NumberFormat('pt-BR').format(n)
}

export function average(values) {
  const nums = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number)
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}
