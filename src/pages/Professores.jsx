import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import DataTable from '../components/DataTable.jsx'
import { Badge, Button, Card, Field, IconButton, Modal, Person, Toast } from '../components/ui.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../hooks/useToast.js'
import { professoresApi } from '../services/index.js'
import { formatCpfInput, formatDate, maskCpf } from '../utils/format.js'

const vazio = { nome: '', cpf: '', email: '', especialidade: '', data_contratacao: '', ativo: true }

function ProfessorModal({ professor, onClose, onSaved }) {
  const editando = Boolean(professor?.id)
  const [form, setForm] = useState(() => (professor ? { ...vazio, ...professor, cpf: formatCpfInput(professor.cpf) } : vazio))
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState('')

  const set = (campo) => (e) => {
    const v = campo === 'cpf' ? formatCpfInput(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [campo]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!form.nome.trim()) found.nome = 'Informe o nome.'
    if (form.cpf.replace(/\D/g, '').length !== 11) found.cpf = 'CPF deve ter 11 dígitos.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'E-mail inválido.'
    if (!form.especialidade.trim()) found.especialidade = 'Informe a especialidade.'
    if (!form.data_contratacao) found.data_contratacao = 'Informe a data de contratação.'
    setErros(found)
    if (Object.keys(found).length) return

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      email: form.email.trim(),
      especialidade: form.especialidade.trim(),
      data_contratacao: form.data_contratacao,
      ativo: form.ativo,
    }
    setSalvando(true)
    setErroApi('')
    try {
      if (editando) await professoresApi.update(professor.id, payload)
      else await professoresApi.create(payload)
      onSaved(editando ? 'Professor atualizado.' : 'Professor cadastrado.')
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
      title={editando ? 'Editar professor' : 'Novo professor'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon="check" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar professor'}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Nome completo" error={erros.nome} className="span-2">
          <input className="input" value={form.nome} onChange={set('nome')} autoFocus />
        </Field>
        <Field label="CPF" error={erros.cpf}>
          <input className="input" value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" inputMode="numeric" />
        </Field>
        <Field label="E-mail profissional" error={erros.email}>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="nome@escola.edu.br" />
        </Field>
        <Field label="Especialidade" error={erros.especialidade}>
          <input className="input" value={form.especialidade} onChange={set('especialidade')} placeholder="Ex.: Matemática" />
        </Field>
        <Field label="Data de contratação" error={erros.data_contratacao}>
          <input className="input" type="date" value={form.data_contratacao} onChange={set('data_contratacao')} />
        </Field>
        <label className="checkbox span-2">
          <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} />
          Professor ativo
        </label>
      </div>
      {erroApi && <div className="alert">{erroApi}</div>}
    </Modal>
  )
}

export default function Professores() {
  const professores = useCollection(professoresApi)
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [situacao, setSituacao] = useState('')
  const [modal, setModal] = useState(null)

  const especialidades = useMemo(
    () => [...new Set(professores.data.map((p) => p.especialidade))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [professores.data],
  )

  const rows = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return professores.data
      .filter((p) => !termo || p.nome.toLowerCase().includes(termo) || p.email.toLowerCase().includes(termo))
      .filter((p) => !especialidade || p.especialidade === especialidade)
      .filter((p) => !situacao || String(p.ativo) === situacao)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [professores.data, busca, especialidade, situacao])

  const ativos = professores.data.filter((p) => p.ativo).length

  async function excluir(p) {
    if (!window.confirm(`Excluir ${p.nome}?`)) return
    try {
      await professoresApi.remove(p.id)
      toast.show('Professor excluído.')
      professores.reload()
    } catch (err) {
      toast.show(err.message)
    }
  }

  return (
    <>
      <Topbar
        title="Professores"
        sub={`${professores.data.length} professores cadastrados · ${ativos} ativos`}
        search={busca}
        onSearch={setBusca}
        searchPlaceholder="Buscar por nome ou e-mail"
      />
      <div className="toolbar">
        <select className="select" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} aria-label="Filtrar por especialidade">
          <option value="">Especialidade: Todas</option>
          {especialidades.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <select className="select" value={situacao} onChange={(e) => setSituacao(e.target.value)} aria-label="Filtrar por situação">
          <option value="">Situação: Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <div className="toolbar-spacer" />
        <Button icon="mais" onClick={() => setModal({})}>
          Novo professor
        </Button>
      </div>
      <Card flush style={{ flex: 1 }}>
        <DataTable
          loading={professores.loading}
          error={professores.error}
          rows={rows}
          columns={[
            { key: 'nome', label: 'Professor', render: (p) => <Person name={p.nome} sub={p.email} /> },
            { key: 'cpf', label: 'CPF', render: (p) => maskCpf(p.cpf) },
            { key: 'especialidade', label: 'Especialidade', render: (p) => <Badge tone="primary">{p.especialidade}</Badge> },
            { key: 'data_contratacao', label: 'Contratação', render: (p) => formatDate(p.data_contratacao) },
            {
              key: 'ativo',
              label: 'Situação',
              render: (p) => <Badge tone={p.ativo ? 'success' : 'neutral'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>,
            },
            {
              key: 'acoes',
              label: '',
              render: (p) => (
                <div className="row-actions">
                  <IconButton icon="editar" label="Editar" onClick={() => setModal(p)} />
                  <IconButton icon="excluir" label="Excluir" onClick={() => excluir(p)} />
                </div>
              ),
            },
          ]}
        />
        <div className="table-footer">
          Mostrando {rows.length} de {professores.data.length} professores
        </div>
      </Card>
      {modal && (
        <ProfessorModal
          professor={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={(msg) => {
            setModal(null)
            toast.show(msg)
            professores.reload()
          }}
        />
      )}
      <Toast message={toast.message} onDone={toast.clear} />
    </>
  )
}
