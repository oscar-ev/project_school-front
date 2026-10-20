export const TURNOS = [
  { value: 'manha', label: 'Manhã', tone: 'warning' },
  { value: 'tarde', label: 'Tarde', tone: 'primary' },
  { value: 'noite', label: 'Noite', tone: 'neutral' },
]

export const STATUS_MATRICULA = [
  { value: 'ativa', label: 'Ativa', tone: 'success' },
  { value: 'trancada', label: 'Trancada', tone: 'warning' },
  { value: 'cancelada', label: 'Cancelada', tone: 'danger' },
  { value: 'concluida', label: 'Concluída', tone: 'primary' },
]

export const TIPOS_AVALIACAO = [
  { value: 'prova', label: 'Prova', tone: 'primary' },
  { value: 'trabalho', label: 'Trabalho', tone: 'warning' },
  { value: 'atividade', label: 'Atividade', tone: 'neutral' },
]

const find = (list, value) => list.find((i) => i.value === value) ?? { label: value ?? '—', tone: 'neutral' }

export const turno = (v) => find(TURNOS, v)
export const statusMatricula = (v) => find(STATUS_MATRICULA, v)
export const tipoAvaliacao = (v) => find(TIPOS_AVALIACAO, v)
