import { createResource } from './api.js'
import { today } from '../utils/format.js'

// Um cliente por entidade do modelo. Ajuste o nome do endpoint aqui se o backend usar outro caminho.
export const alunosApi = createResource('alunos', {
  onCreate: (data) => ({ data_cadastro: today(), ...data }),
})
export const professoresApi = createResource('professores')
export const disciplinasApi = createResource('disciplinas')
export const turmasApi = createResource('turmas')
export const matriculasApi = createResource('matriculas')
export const notasApi = createResource('notas')
