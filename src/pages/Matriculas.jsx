import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import DataTable from '../components/DataTable.jsx'
import { Badge, Button, Card, Field, IconButton, Modal, Person, Tabs, Toast } from '../components/ui.jsx'
import { byId, useCollection } from '../hooks/useCollection.js'
import { useToast } from '../hooks/useToast.js'
import { alunosApi, matriculasApi, turmasApi } from '../services/index.js'
import { formatDate, today } from '../utils/format.js'
import { STATUS_MATRICULA, statusMatricula, turno } from '../utils/labels.js'

function MatriculaModal({ matricula, alunos, turmas, matriculas, onClose, onSaved }) {
  const editando = Boolean(matricula?.id)
  const [form, setForm] = useState(() =>
    matricula
      ? { aluno_id: String(matricula.aluno_id), turma_id: String(matricula.turma_id), data_matricula: matricula.data_matricula, status: matricula.status }
      : { aluno_id: '', turma_id: '', data_matricula: today(), status: 'ativa' },
  )
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState('')
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const ocupacao = useMemo(() => {
    const t = turmas.find((x) => String(x.id) === form.turma_id)
    if (!t) return null
    const ativos = matriculas.filter((m) => m.turma_id === t.id && m.status === 'ativa' && m.id !== matricula?.id).length
    return { ativos, capacidade: t.capacidade }
  }, [form.turma_id, turmas, matriculas, matricula])

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!form.aluno_id) found.aluno_id = 'Selecione o aluno.'
    if (!form.turma_id) found.turma_id = 'Selecione a turma.'
    if (!form.data_matricula) found.data_matricula = 'Informe a data.'
    if (form.status === 'ativa' && ocupacao && ocupacao.ativos >= ocupacao.capacidade) found.turma_id = 'Turma lotada.'
    setErros(found)
    if (Object.keys(found).length) return

    const payload = {
      aluno_id: Number(form.aluno_id),
      turma_id: Number(form.turma_id),
      data_matricula: form.data_matricula,
      status: form.status,
    }
    setSalvando(true)
    setErroApi('')
    try {
      if (editando) await matriculasApi.update(matricula.id, payload)
      else await matriculasApi.create(payload)
      onSaved(editando ? 'Matrícula atualizada.' : 'Matrícula registrada.')
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
      title={editando ? 'Editar matrícula' : 'Nova matrícula'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon="check" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar matrícula'}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Aluno" error={erros.aluno_id} className="span-2">
          <select className="input" value={form.aluno_id} onChange={set('aluno_id')}>
            <option value="">Selecione o aluno</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Turma" error={erros.turma_id} className="span-2">
          <select className="input" value={form.turma_id} onChange={set('turma_id')}>
            <option value="">Selecione a turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} · {t.ano_letivo} · {turno(t.turno).label}
              </option>
            ))}
          </select>
          {ocupacao && (
            <span className="muted" style={{ fontSize: 12 }}>
              {ocupacao.ativos} de {ocupacao.capacidade} vagas ocupadas
            </span>
          )}
        </Field>
        <Field label="Data da matrícula" error={erros.data_matricula}>
          <input className="input" type="date" value={form.data_matricula} onChange={set('data_matricula')} />
        </Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={set('status')}>
            {STATUS_MATRICULA.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {erroApi && <div className="alert">{erroApi}</div>}
    </Modal>
  )
}

export default function Matriculas() {
  const matriculas = useCollection(matriculasApi)
  const alunos = useCollection(alunosApi)
  const turmas = useCollection(turmasApi)
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [turmaFiltro, setTurmaFiltro] = useState('')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null)

  const alunosOrdenados = useMemo(() => [...alunos.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')), [alunos.data])
  const turmasOrdenadas = useMemo(
    () => [...turmas.data].sort((a, b) => b.ano_letivo - a.ano_letivo || a.nome.localeCompare(b.nome, 'pt-BR')),
    [turmas.data],
  )

  const rows = useMemo(() => {
    const alunoMap = byId(alunos.data)
    const turmaMap = byId(turmas.data)
    const termo = busca.trim().toLowerCase()
    return matriculas.data
      .map((m) => ({ ...m, aluno: alunoMap[m.aluno_id], turma: turmaMap[m.turma_id] }))
      .filter((m) => !status || m.status === status)
      .filter((m) => !turmaFiltro || String(m.turma_id) === turmaFiltro)
      .filter((m) => !termo || m.aluno?.nome.toLowerCase().includes(termo))
      .sort((a, b) => b.data_matricula.localeCompare(a.data_matricula) || b.id - a.id)
  }, [matriculas.data, alunos.data, turmas.data, status, turmaFiltro, busca])

  const contagem = (s) => matriculas.data.filter((m) => !s || m.status === s).length
  const tabs = [{ value: '', label: `Todas · ${contagem('')}` }, ...STATUS_MATRICULA.map((s) => ({ value: s.value, label: `${s.label}s · ${contagem(s.value)}` }))]

  async function excluir(m) {
    if (!window.confirm(`Excluir a matrícula de ${m.aluno?.nome ?? 'aluno'}?`)) return
    try {
      await matriculasApi.remove(m.id)
      toast.show('Matrícula excluída.')
      matriculas.reload()
    } catch (err) {
      toast.show(err.message)
    }
  }

  return (
    <>
      <Topbar
        title="Matrículas"
        sub={`${matriculas.data.length} matrículas registradas`}
        search={busca}
        onSearch={setBusca}
        searchPlaceholder="Buscar aluno"
      />
      <div className="toolbar">
        <Tabs value={status} onChange={setStatus} options={tabs} />
        <select className="select" value={turmaFiltro} onChange={(e) => setTurmaFiltro(e.target.value)} aria-label="Filtrar por turma">
          <option value="">Turma: Todas</option>
          {turmasOrdenadas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} · {t.ano_letivo}
            </option>
          ))}
        </select>
        <div className="toolbar-spacer" />
        <Button icon="mais" onClick={() => setModal({})}>
          Nova matrícula
        </Button>
      </div>
      <Card flush style={{ flex: 1 }}>
        <DataTable
          loading={matriculas.loading}
          error={matriculas.error}
          rows={rows}
          empty="Nenhuma matrícula encontrada."
          columns={[
            { key: 'aluno', label: 'Aluno', render: (m) => <Person name={m.aluno?.nome ?? `Aluno #${m.aluno_id}`} sub={m.aluno?.email} /> },
            { key: 'turma', label: 'Turma', render: (m) => m.turma?.nome ?? '—' },
            { key: 'turno', label: 'Turno', render: (m) => (m.turma ? turno(m.turma.turno).label : '—') },
            { key: 'ano', label: 'Ano letivo', render: (m) => m.turma?.ano_letivo ?? '—' },
            { key: 'data_matricula', label: 'Data da matrícula', render: (m) => formatDate(m.data_matricula) },
            {
              key: 'status',
              label: 'Status',
              render: (m) => {
                const s = statusMatricula(m.status)
                return <Badge tone={s.tone}>{s.label}</Badge>
              },
            },
            {
              key: 'acoes',
              label: '',
              render: (m) => (
                <div className="row-actions">
                  <IconButton icon="editar" label="Editar" onClick={() => setModal(m)} />
                  <IconButton icon="excluir" label="Excluir" onClick={() => excluir(m)} />
                </div>
              ),
            },
          ]}
        />
        <div className="table-footer">
          Mostrando {rows.length} de {matriculas.data.length} matrículas
        </div>
      </Card>
      {modal && (
        <MatriculaModal
          matricula={modal.id ? modal : null}
          alunos={alunosOrdenados}
          turmas={turmasOrdenadas}
          matriculas={matriculas.data}
          onClose={() => setModal(null)}
          onSaved={(msg) => {
            setModal(null)
            toast.show(msg)
            matriculas.reload()
          }}
        />
      )}
      <Toast message={toast.message} onDone={toast.clear} />
    </>
  )
}
