import { useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import { Badge, Button, Card, Field, Person, Tabs, Toast } from '../components/ui.jsx'
import { byId, useCollection } from '../hooks/useCollection.js'
import { useToast } from '../hooks/useToast.js'
import { alunosApi, disciplinasApi, matriculasApi, notasApi, professoresApi, turmasApi } from '../services/index.js'
import { average, formatDate, formatNota, maskCpf, today } from '../utils/format.js'
import { TIPOS_AVALIACAO, tipoAvaliacao } from '../utils/labels.js'
import './Notas.css'

const anoAtual = new Date().getFullYear()

function parseNota(texto) {
  if (texto === '' || texto === undefined) return null
  const n = Number(String(texto).replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

export default function Notas() {
  const turmas = useCollection(turmasApi)
  const disciplinas = useCollection(disciplinasApi)
  const professores = useCollection(professoresApi)
  const alunos = useCollection(alunosApi)
  const matriculas = useCollection(matriculasApi)
  const notas = useCollection(notasApi)
  const toast = useToast()

  const [escolha, setEscolha] = useState({ turma_id: '', disciplina_id: '', professor_id: '', data_avaliacao: today(), tipo_avaliacao: 'prova' })
  const [edicoes, setEdicoes] = useState({})
  const [salvando, setSalvando] = useState(false)

  // Enquanto o usuário não escolhe, usa a primeira opção de cada lista
  const filtro = {
    ...escolha,
    turma_id: escolha.turma_id || String(turmas.data.find((t) => t.ano_letivo === anoAtual)?.id ?? turmas.data[0]?.id ?? ''),
    disciplina_id: escolha.disciplina_id || String(disciplinas.data[0]?.id ?? ''),
    professor_id: escolha.professor_id || String(professores.data.find((p) => p.ativo)?.id ?? ''),
  }
  const setFiltro = (fn) => setEscolha(fn(filtro))
  const set = (campo) => (e) => {
    const v = e.target.value
    setFiltro((f) => ({ ...f, [campo]: v }))
  }

  // Alunos com matrícula ativa na turma escolhida
  const alunoMap = byId(alunos.data)
  const alunosTurma = matriculas.data
    .filter((m) => String(m.turma_id) === filtro.turma_id && m.status === 'ativa')
    .map((m) => alunoMap[m.aluno_id])
    .filter(Boolean)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const idsTurma = new Set(alunosTurma.map((a) => a.id))

  // Notas já lançadas para esta avaliação (mesma disciplina, tipo e data)
  const existentes = {}
  for (const n of notas.data) {
    if (
      idsTurma.has(n.aluno_id) &&
      String(n.disciplina_id) === filtro.disciplina_id &&
      n.tipo_avaliacao === filtro.tipo_avaliacao &&
      n.data_avaliacao === filtro.data_avaliacao
    ) {
      existentes[n.aluno_id] = n
    }
  }

  // Valores exibidos = notas já salvas + o que foi digitado nesta avaliação
  const chaveAvaliacao = [filtro.turma_id, filtro.disciplina_id, filtro.tipo_avaliacao, filtro.data_avaliacao].join('|')
  const valores = {
    ...Object.fromEntries(Object.values(existentes).map((n) => [n.aluno_id, formatNota(n.valor)])),
    ...edicoes[chaveAvaliacao],
  }
  const setValor = (alunoId, texto) =>
    setEdicoes((e) => ({ ...e, [chaveAvaliacao]: { ...e[chaveAvaliacao], [alunoId]: texto } }))

  // Avaliações já lançadas desta turma e disciplina, agrupadas por data e tipo
  const grupos = {}
  for (const n of notas.data) {
    if (!idsTurma.has(n.aluno_id) || String(n.disciplina_id) !== filtro.disciplina_id) continue
    const key = `${n.data_avaliacao}|${n.tipo_avaliacao}`
    grupos[key] ??= { data: n.data_avaliacao, tipo: n.tipo_avaliacao, professor_id: n.professor_id, valores: [] }
    grupos[key].valores.push(n.valor)
  }
  const anteriores = Object.values(grupos)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 6)

  const lancadas = alunosTurma.map((a) => parseNota(valores[a.id])).filter((v) => v !== null && !Number.isNaN(v))
  const invalidos = alunosTurma.filter((a) => {
    const v = parseNota(valores[a.id])
    return v !== null && (Number.isNaN(v) || v < 0 || v > 10)
  })

  async function salvar() {
    if (!filtro.turma_id || !filtro.disciplina_id || !filtro.professor_id || !filtro.data_avaliacao) {
      toast.show('Preencha turma, disciplina, professor e data.')
      return
    }
    if (invalidos.length) {
      toast.show('Há notas fora do intervalo de 0 a 10.')
      return
    }
    setSalvando(true)
    try {
      const ops = []
      for (const a of alunosTurma) {
        const v = parseNota(valores[a.id])
        const atual = existentes[a.id]
        const payload = {
          aluno_id: a.id,
          disciplina_id: Number(filtro.disciplina_id),
          professor_id: Number(filtro.professor_id),
          valor: v,
          tipo_avaliacao: filtro.tipo_avaliacao,
          data_avaliacao: filtro.data_avaliacao,
        }
        if (v === null) {
          if (atual) ops.push(notasApi.remove(atual.id))
        } else if (atual) {
          if (atual.valor !== v || atual.professor_id !== payload.professor_id) ops.push(notasApi.update(atual.id, payload))
        } else {
          ops.push(notasApi.create(payload))
        }
      }
      await Promise.all(ops)
      toast.show(ops.length ? 'Notas salvas.' : 'Nada para salvar.')
      setEdicoes((e) => ({ ...e, [chaveAvaliacao]: {} }))
      notas.reload()
    } catch (err) {
      toast.show(err.message)
    } finally {
      setSalvando(false)
    }
  }

  const turmaAtual = turmas.data.find((t) => String(t.id) === filtro.turma_id)
  const disciplinaAtual = disciplinas.data.find((d) => String(d.id) === filtro.disciplina_id)
  const profMap = byId(professores.data)
  const media = average(lancadas)

  return (
    <>
      <Topbar title="Lançamento de notas" sub="Registre uma avaliação para os alunos da turma" />

      <Card title="Avaliação">
        <div className="notas-filtros">
          <Field label="Turma">
            <select className="input" value={filtro.turma_id} onChange={set('turma_id')}>
              {turmas.data.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} · {t.ano_letivo}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Disciplina">
            <select className="input" value={filtro.disciplina_id} onChange={set('disciplina_id')}>
              {disciplinas.data.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Professor">
            <select className="input" value={filtro.professor_id} onChange={set('professor_id')}>
              {professores.data
                .filter((p) => p.ativo || String(p.id) === filtro.professor_id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Data da avaliação">
            <input className="input" type="date" value={filtro.data_avaliacao} onChange={set('data_avaliacao')} />
          </Field>
          <div className="field">
            <span className="field-label">Tipo de avaliação</span>
            <Tabs segmented value={filtro.tipo_avaliacao} onChange={(v) => setFiltro((f) => ({ ...f, tipo_avaliacao: v }))} options={TIPOS_AVALIACAO} />
          </div>
        </div>
      </Card>

      <div className="notas-layout">
        <Card
          flush
          title="Notas dos alunos"
          sub={`${alunosTurma.length} alunos com matrícula ativa${turmaAtual ? ` em ${turmaAtual.nome}` : ''}`}
          actions={
            <Button icon="check" onClick={salvar} disabled={salvando || alunosTurma.length === 0}>
              {salvando ? 'Salvando…' : 'Salvar notas'}
            </Button>
          }
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th className="num">Nota (0–10)</th>
                </tr>
              </thead>
              <tbody>
                {alunosTurma.length === 0 && (
                  <tr>
                    <td colSpan={2} className="table-empty">
                      {matriculas.loading ? 'Carregando…' : 'Nenhum aluno com matrícula ativa nesta turma.'}
                    </td>
                  </tr>
                )}
                {alunosTurma.map((a) => {
                  const v = parseNota(valores[a.id])
                  const erro = v !== null && (Number.isNaN(v) || v < 0 || v > 10)
                  return (
                    <tr key={a.id}>
                      <td>
                        <Person name={a.nome} sub={maskCpf(a.cpf)} />
                      </td>
                      <td className="num">
                        <input
                          className={`grade-input ${v !== null && v < 6 ? 'low' : ''}`}
                          style={erro ? { borderColor: 'var(--color-danger)' } : undefined}
                          inputMode="decimal"
                          placeholder="—"
                          aria-label={`Nota de ${a.nome}`}
                          value={valores[a.id] ?? ''}
                          onChange={(e) => setValor(a.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="notas-side">
          <Card title="Resumo desta avaliação">
            <dl className="resumo">
              <div>
                <dt>Notas lançadas</dt>
                <dd>
                  {lancadas.length} de {alunosTurma.length}
                </dd>
              </div>
              <div>
                <dt>Média</dt>
                <dd>{formatNota(media)}</dd>
              </div>
              <div>
                <dt>Maior nota</dt>
                <dd>{lancadas.length ? formatNota(Math.max(...lancadas)) : '—'}</dd>
              </div>
              <div>
                <dt>Menor nota</dt>
                <dd>{lancadas.length ? formatNota(Math.min(...lancadas)) : '—'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Avaliações anteriores" sub={[turmaAtual?.nome, disciplinaAtual?.nome].filter(Boolean).join(' · ')}>
            {anteriores.length === 0 && <p className="muted">Nenhuma avaliação lançada.</p>}
            {anteriores.map((g) => {
              const t = tipoAvaliacao(g.tipo)
              return (
                <button
                  type="button"
                  key={`${g.data}-${g.tipo}`}
                  className="avaliacao-item"
                  onClick={() =>
                    setFiltro((f) => ({ ...f, data_avaliacao: g.data, tipo_avaliacao: g.tipo, professor_id: String(g.professor_id) }))
                  }
                  title={`Abrir avaliação de ${formatDate(g.data)} · ${profMap[g.professor_id]?.nome ?? ''}`}
                >
                  <Badge tone={t.tone}>{t.label}</Badge>
                  <span className="muted">{formatDate(g.data)}</span>
                  <strong>Média {formatNota(average(g.valores))}</strong>
                </button>
              )
            })}
          </Card>
        </div>
      </div>
      <Toast message={toast.message} onDone={toast.clear} />
    </>
  )
}
