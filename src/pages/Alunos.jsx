import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import DataTable from '../components/DataTable.jsx'
import { Badge, Button, Card, Field, IconButton, Modal, Person, Toast } from '../components/ui.jsx'
import { byId, latestMatriculaByAluno, useCollection } from '../hooks/useCollection.js'
import { useToast } from '../hooks/useToast.js'
import { alunosApi, matriculasApi, turmasApi } from '../services/index.js'
import { formatCpfInput, formatDate, formatPhoneInput, maskCpf, today } from '../utils/format.js'
import { STATUS_MATRICULA, statusMatricula } from '../utils/labels.js'

const vazio = { nome: '', cpf: '', data_nascimento: '', email: '', telefone: '' }

function validar(form) {
  const erros = {}
  if (!form.nome.trim()) erros.nome = 'Informe o nome.'
  if (form.cpf.replace(/\D/g, '').length !== 11) erros.cpf = 'CPF deve ter 11 dígitos.'
  if (!form.data_nascimento) erros.data_nascimento = 'Informe a data de nascimento.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) erros.email = 'E-mail inválido.'
  return erros
}

function AlunoModal({ aluno, turmas, onClose, onSaved }) {
  const editando = Boolean(aluno?.id)
  const [form, setForm] = useState(() =>
    aluno
      ? { ...vazio, ...aluno, cpf: formatCpfInput(aluno.cpf), telefone: formatPhoneInput(aluno.telefone ?? '') }
      : vazio,
  )
  const [matricula, setMatricula] = useState({ turma_id: '', data_matricula: today(), status: 'ativa' })
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState('')

  const set = (campo) => (e) => {
    let v = e.target.value
    if (campo === 'cpf') v = formatCpfInput(v)
    if (campo === 'telefone') v = formatPhoneInput(v)
    setForm((f) => ({ ...f, [campo]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const encontrados = validar(form)
    setErros(encontrados)
    if (Object.keys(encontrados).length) return

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      data_nascimento: form.data_nascimento,
      email: form.email.trim(),
      telefone: form.telefone.replace(/\D/g, ''),
    }

    setSalvando(true)
    setErroApi('')
    try {
      if (editando) {
        await alunosApi.update(aluno.id, payload)
      } else {
        const novo = await alunosApi.create(payload)
        if (matricula.turma_id) {
          await matriculasApi.create({
            aluno_id: novo.id,
            turma_id: Number(matricula.turma_id),
            data_matricula: matricula.data_matricula,
            status: matricula.status,
          })
        }
      }
      onSaved(editando ? 'Aluno atualizado.' : 'Aluno cadastrado.')
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
      title={editando ? 'Editar aluno' : 'Novo aluno'}
      sub={editando ? 'Atualize os dados do aluno.' : 'Cadastre o aluno e, se quiser, já faça a matrícula.'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon="check" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar aluno'}
          </Button>
        </>
      }
    >
      <div className="form-section">Aluno</div>
      <div className="form-grid">
        <Field label="Nome completo" error={erros.nome} className="span-2">
          <input className="input" value={form.nome} onChange={set('nome')} placeholder="Ex.: Ana Clara Ribeiro" autoFocus />
        </Field>
        <Field label="CPF" error={erros.cpf}>
          <input className="input" value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" inputMode="numeric" />
        </Field>
        <Field label="Data de nascimento" error={erros.data_nascimento}>
          <input className="input" type="date" value={form.data_nascimento} onChange={set('data_nascimento')} />
        </Field>
        <Field label="E-mail" error={erros.email}>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="aluno@email.com" />
        </Field>
        <Field label="Telefone">
          <input className="input" value={form.telefone} onChange={set('telefone')} placeholder="(11) 90000-0000" inputMode="tel" />
        </Field>
      </div>

      {!editando && (
        <>
          <div className="form-section">Matrícula (opcional)</div>
          <div className="form-grid">
            <Field label="Turma">
              <select
                className="input"
                value={matricula.turma_id}
                onChange={(e) => setMatricula((m) => ({ ...m, turma_id: e.target.value }))}
              >
                <option value="">Sem matrícula por enquanto</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} · {t.ano_letivo}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data da matrícula">
              <input
                className="input"
                type="date"
                value={matricula.data_matricula}
                disabled={!matricula.turma_id}
                onChange={(e) => setMatricula((m) => ({ ...m, data_matricula: e.target.value }))}
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={matricula.status}
                disabled={!matricula.turma_id}
                onChange={(e) => setMatricula((m) => ({ ...m, status: e.target.value }))}
              >
                {STATUS_MATRICULA.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </>
      )}

      {erroApi && <div className="alert">{erroApi}</div>}
    </Modal>
  )
}

export default function Alunos() {
  const alunos = useCollection(alunosApi)
  const turmas = useCollection(turmasApi)
  const matriculas = useCollection(matriculasApi)
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [params] = useSearchParams()
  const [turmaFiltro, setTurmaFiltro] = useState(params.get('turma') ?? '')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [modal, setModal] = useState(null) // null | {} | aluno

  const rows = useMemo(() => {
    const turmaMap = byId(turmas.data)
    const matAtual = latestMatriculaByAluno(matriculas.data)
    const termo = busca.trim().toLowerCase()
    const digitos = termo.replace(/\D/g, '')
    const confere = (a) =>
      !termo ||
      a.nome.toLowerCase().includes(termo) ||
      a.email?.toLowerCase().includes(termo) ||
      (digitos.length > 0 && a.cpf.includes(digitos))
    return alunos.data
      .map((a) => {
        const m = matAtual[a.id]
        return { ...a, matricula: m, turma: m ? turmaMap[m.turma_id] : null }
      })
      .filter(confere)
      .filter((a) => !turmaFiltro || String(a.turma?.id) === turmaFiltro)
      .filter((a) => !statusFiltro || (statusFiltro === 'sem' ? !a.matricula : a.matricula?.status === statusFiltro))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [alunos.data, turmas.data, matriculas.data, busca, turmaFiltro, statusFiltro])

  async function excluir(aluno) {
    if (!window.confirm(`Excluir ${aluno.nome}? Essa ação não pode ser desfeita.`)) return
    try {
      await alunosApi.remove(aluno.id)
      toast.show('Aluno excluído.')
      alunos.reload()
    } catch (err) {
      toast.show(err.message)
    }
  }

  return (
    <>
      <Topbar
        title="Alunos"
        sub={`${alunos.data.length} alunos cadastrados`}
        search={busca}
        onSearch={setBusca}
        searchPlaceholder="Nome, e-mail ou CPF"
      />

      <div className="toolbar">
        <select className="select" value={turmaFiltro} onChange={(e) => setTurmaFiltro(e.target.value)} aria-label="Filtrar por turma">
          <option value="">Turma: Todas</option>
          {turmas.data.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} · {t.ano_letivo}
            </option>
          ))}
        </select>
        <select className="select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} aria-label="Filtrar por status da matrícula">
          <option value="">Matrícula: Todas</option>
          {STATUS_MATRICULA.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
          <option value="sem">Sem matrícula</option>
        </select>
        <div className="toolbar-spacer" />
        <Button icon="mais" onClick={() => setModal({})}>
          Novo aluno
        </Button>
      </div>

      <Card flush style={{ flex: 1 }}>
        <DataTable
          loading={alunos.loading}
          error={alunos.error}
          rows={rows}
          empty="Nenhum aluno encontrado com esses filtros."
          columns={[
            { key: 'nome', label: 'Aluno', render: (a) => <Person name={a.nome} sub={a.email} /> },
            { key: 'cpf', label: 'CPF', render: (a) => maskCpf(a.cpf) },
            { key: 'data_nascimento', label: 'Nascimento', render: (a) => formatDate(a.data_nascimento) },
            { key: 'telefone', label: 'Telefone', render: (a) => formatPhoneInput(a.telefone ?? '') || '—' },
            { key: 'turma', label: 'Turma', render: (a) => a.turma?.nome ?? '—' },
            { key: 'data_cadastro', label: 'Cadastro', render: (a) => formatDate(a.data_cadastro) },
            {
              key: 'status',
              label: 'Matrícula',
              render: (a) => {
                if (!a.matricula) return <Badge>Sem matrícula</Badge>
                const s = statusMatricula(a.matricula.status)
                return <Badge tone={s.tone}>{s.label}</Badge>
              },
            },
            {
              key: 'acoes',
              label: '',
              render: (a) => (
                <div className="row-actions">
                  <IconButton icon="editar" label="Editar" onClick={() => setModal(a)} />
                  <IconButton icon="excluir" label="Excluir" onClick={() => excluir(a)} />
                </div>
              ),
            },
          ]}
        />
        <div className="table-footer">
          Mostrando {rows.length} de {alunos.data.length} alunos
        </div>
      </Card>

      {modal && (
        <AlunoModal
          aluno={modal.id ? modal : null}
          turmas={turmas.data}
          onClose={() => setModal(null)}
          onSaved={(msg) => {
            setModal(null)
            toast.show(msg)
            alunos.reload()
            matriculas.reload()
          }}
        />
      )}
      <Toast message={toast.message} onDone={toast.clear} />
    </>
  )
}
