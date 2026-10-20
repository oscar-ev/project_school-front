import { useCallback, useEffect, useState } from 'react'

/** Carrega a lista de um recurso e expõe estados de carregamento e erro. */
export function useCollection(api, params) {
  const key = JSON.stringify(params ?? {})
  const [version, setVersion] = useState(0)
  const [state, setState] = useState({ data: [], error: null, loaded: false })

  useEffect(() => {
    let ativo = true
    api.list(JSON.parse(key)).then(
      (data) => ativo && setState({ data, error: null, loaded: true }),
      (err) => ativo && setState((s) => ({ ...s, error: err.message, loaded: true })),
    )
    return () => {
      ativo = false
    }
  }, [api, key, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { data: state.data, error: state.error, loading: !state.loaded, reload }
}

/** Índice por id: { 1: {...}, 2: {...} } */
export function byId(rows) {
  return Object.fromEntries(rows.map((r) => [r.id, r]))
}

/** Matrícula mais recente de cada aluno: { aluno_id: matricula } */
export function latestMatriculaByAluno(matriculas) {
  const map = {}
  for (const m of matriculas) {
    const cur = map[m.aluno_id]
    if (!cur || m.data_matricula > cur.data_matricula) map[m.aluno_id] = m
  }
  return map
}
