import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import { Badge, Button, Card, Field, IconButton, Modal, Progress, Tabs, Toast } from '../components/ui.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../hooks/useToast.js'
import { matriculasApi, turmasApi } from '../services/index.js'
import { TURNOS, turno as turnoLabel } from '../utils/labels.js'
import './Turmas.css'

const anoAtual = new Date().getFullYear()
const vazio = { nome: '', ano_letivo: String(anoAtual), turno: 'manha', capacidade: '' }

function TurmaModal({ turma, onClose, onSaved }) {
  const editando = Boolean(turma?.id)
  const [form, setForm] = useState(() =>
    turma ? { nome: turma.nome, ano_letivo: String(turma.ano_letivo), turno: turma.turno, capacidade: String(turma.capacidade) } : vazio,
  )
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState('')
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!form.nome.trim()) found.nome = 'Informe o nome da turma.'
    if (!/^\d{4}$/.test(form.ano_letivo)) found.ano_letivo = 'Ano inválido.'
    const cap = Number(form.capacidade)
    if (!Number.isInteger(cap) || cap <= 0) found.capacidade = 'Informe a capacidade.'
    setErros(found)
    if (Object.keys(found).length) return

    const payload = { nome: form.nome.trim(), ano_letivo: Number(form.ano_letivo), turno: form.turno, capacidade: cap }
    setSalvando(true)
    setErroApi('')
    try {
      if (editando) await turmasApi.update(turma.id, payload)
      else await turmasApi.create(payload)
      onSaved(editando ? 'Turma atualizada.' : 'Turma criada.')
    } catch (err) {
      setErroApi(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      as="form"
      onSubmit={handleSubmit}
      noValidate
      title={editando ? 'Editar turma' : 'Nova turma'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon="check" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar turma'}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Nome" error={erros.nome} className="span-2">
          <input className="input" value={form.nome} onChange={set('nome')} placeholder="Ex.: 1º ano A" autoFocus />
        </Field>
        <Field label="Ano letivo" error={erros.ano_letivo}>
          <input className="input" type="number" value={form.ano_letivo} onChange={set('ano_letivo')} />
        </Field>
        <Field label="Turno">
          <select className="input" value={form.turno} onChange={set('turno')}>
            {TURNOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Capacidade (máx. de alunos)" error={erros.capacidade}>
          <input className="input" type="number" min="1" value={form.capacidade} onChange={set('capacidade')} placeholder="Ex.: 40" />
        </Field>
      </div>
      {erroApi && <div className="alert">{erroApi}</div>}
    </Modal>
  )
}

export default function Turmas() {
  const turmas = useCollection(turmasApi)
  const matriculas = useCollection(matriculasApi)
  const toast = useToast()
  const [turno, setTurno] = useState('')
  const [ano, setAno] = useState(String(anoAtual))
  const [modal, setModal] = useState(null)

  const anos = useMemo(() => [...new Set(turmas.data.map((t) => t.ano_letivo))].sort((a, b) => b - a), [turmas.data])

  const cards = useMemo(
    () =>
      turmas.data
        .filter((t) => !ano || String(t.ano_letivo) === ano)
        .filter((t) => !turno || t.turno === turno)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        .map((t) => ({
          ...t,
          matriculados: matriculas.data.filter((m) => m.turma_id === t.id && m.status === 'ativa').length,
        })),
    [turmas.data, matriculas.data, ano, turno],
  )

  const doAno = turmas.data.filter((t) => String(t.ano_letivo) === ano).length

  async function excluir(t) {
    if (!window.confirm(`Excluir a turma ${t.nome} (${t.ano_letivo})?`)) return
    try {
      await turmasApi.remove(t.id)
      toast.show('Turma excluída.')
      turmas.reload()
    } catch (err) {
      toast.show(err.message)
    }
  }

  return (
    <>
      <Topbar title="Turmas" sub={`${doAno} turmas no ano letivo de ${ano || 'todos os anos'}`} />
      <div className="toolbar">
        <Tabs value={turno} onChange={setTurno} options={[{ value: '', label: 'Todos os turnos' }, ...TURNOS]} />
        <select className="select" value={ano} onChange={(e) => setAno(e.target.value)} aria-label="Ano letivo">
          <option value="">Ano letivo: Todos</option>
          {anos.map((a) => (
            <option key={a} value={a}>
              Ano letivo: {a}
            </option>
          ))}
        </select>
        <div className="toolbar-spacer" />
        <Button icon="mais" onClick={() => setModal({})}>
          Nova turma
        </Button>
      </div>

      {turmas.loading ? (
        <p className="empty-state">Carregando…</p>
      ) : turmas.error ? (
        <div className="alert">{turmas.error}</div>
      ) : cards.length === 0 ? (
        <p className="empty-state">Nenhuma turma encontrada.</p>
      ) : (
        <div className="turmas-grid">
          {cards.map((t) => {
            const tl = turnoLabel(t.turno)
            const livres = Math.max(0, t.capacidade - t.matriculados)
            const pct = t.capacidade ? Math.round((t.matriculados / t.capacidade) * 100) : 0
            return (
              <Card key={t.id} className="turma-card">
                <div className="turma-top">
                  <div>
                    <h2 className="display turma-nome">{t.nome}</h2>
                    <p className="muted">Ano letivo {t.ano_letivo}</p>
                  </div>
                  <Badge tone={tl.tone}>{tl.label}</Badge>
                </div>
                <div className="turma-metrics">
                  <div>
                    <strong>{t.matriculados}</strong>
                    <span>Matriculados</span>
                  </div>
                  <div>
                    <strong>{t.capacidade}</strong>
                    <span>Capacidade</span>
                  </div>
                  <div>
                    <strong className={livres === 0 ? 'text-danger' : ''}>{livres}</strong>
                    <span>Vagas livres</span>
                  </div>
                </div>
                <div className="turma-ocupacao">
                  <div className="turma-ocupacao-label">
                    <span className="muted">Ocupação</span>
                    <strong>{pct}%</strong>
                  </div>
                  <Progress value={t.matriculados} max={t.capacidade} />
                </div>
                <div className="turma-footer">
                  <span className={livres === 0 ? 'text-danger' : 'text-success'}>
                    {livres === 0 ? 'Turma lotada' : 'Com vagas'}
                  </span>
                  <IconButton icon="editar" label="Editar turma" onClick={() => setModal(t)} />
                  <IconButton icon="excluir" label="Excluir turma" onClick={() => excluir(t)} />
                  <Link className="btn btn-ghost" to={`/alunos?turma=${t.id}`}>
                    Ver alunos
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {modal && (
        <TurmaModal
          turma={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={(msg) => {
            setModal(null)
            toast.show(msg)
            turmas.reload()
          }}
        />
      )}
      <Toast message={toast.message} onDone={toast.clear} />
    </>
  )
}
