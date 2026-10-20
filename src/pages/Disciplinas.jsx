import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import DataTable from '../components/DataTable.jsx'
import { Button, Card, Field, IconButton, Toast } from '../components/ui.jsx'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../hooks/useToast.js'
import { disciplinasApi } from '../services/index.js'
import './Disciplinas.css'

const vazio = { nome: '', descricao: '', carga_horaria: '' }

export default function Disciplinas() {
  const disciplinas = useCollection(disciplinasApi)
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState(vazio)
  const [editId, setEditId] = useState(null)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  const rows = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return disciplinas.data
      .filter((d) => !termo || d.nome.toLowerCase().includes(termo) || d.descricao?.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [disciplinas.data, busca])

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function limpar() {
    setForm(vazio)
    setEditId(null)
    setErros({})
  }

  function editar(d) {
    setForm({ nome: d.nome, descricao: d.descricao ?? '', carga_horaria: String(d.carga_horaria ?? '') })
    setEditId(d.id)
    setErros({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!form.nome.trim()) found.nome = 'Informe o nome.'
    const carga = Number(form.carga_horaria)
    if (!Number.isInteger(carga) || carga <= 0) found.carga_horaria = 'Informe a carga horária em horas.'
    setErros(found)
    if (Object.keys(found).length) return

    const payload = { nome: form.nome.trim(), descricao: form.descricao.trim(), carga_horaria: carga }
    setSalvando(true)
    try {
      if (editId) await disciplinasApi.update(editId, payload)
      else await disciplinasApi.create(payload)
      toast.show(editId ? 'Disciplina atualizada.' : 'Disciplina cadastrada.')
      limpar()
      disciplinas.reload()
    } catch (err) {
      toast.show(err.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(d) {
    if (!window.confirm(`Excluir a disciplina ${d.nome}?`)) return
    try {
      await disciplinasApi.remove(d.id)
      if (editId === d.id) limpar()
      toast.show('Disciplina excluída.')
      disciplinas.reload()
    } catch (err) {
      toast.show(err.message)
    }
  }

  return (
    <>
      <Topbar
        title="Disciplinas"
        sub={`${disciplinas.data.length} disciplinas cadastradas`}
        search={busca}
        onSearch={setBusca}
        searchPlaceholder="Buscar disciplina"
      />
      <div className="disc-layout">
        <Card flush title="Disciplinas cadastradas" sub="Carga horária total por ano letivo">
          <DataTable
            loading={disciplinas.loading}
            error={disciplinas.error}
            rows={rows}
            columns={[
              { key: 'nome', label: 'Disciplina', className: 'nowrap', render: (d) => <strong>{d.nome}</strong> },
              { key: 'descricao', label: 'Descrição', render: (d) => <span className="muted">{d.descricao || '—'}</span> },
              { key: 'carga_horaria', label: 'Carga horária', className: 'num', render: (d) => `${d.carga_horaria} h` },
              {
                key: 'acoes',
                label: '',
                render: (d) => (
                  <div className="row-actions">
                    <IconButton icon="editar" label="Editar" onClick={() => editar(d)} />
                    <IconButton icon="excluir" label="Excluir" onClick={() => excluir(d)} />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Card
          title={editId ? 'Editar disciplina' : 'Nova disciplina'}
          sub={editId ? 'Altere os dados e salve.' : 'Preencha os dados da disciplina'}
        >
          <form className="disc-form" onSubmit={handleSubmit} noValidate>
            <Field label="Nome" error={erros.nome}>
              <input className="input" value={form.nome} onChange={set('nome')} placeholder="Ex.: Filosofia" />
            </Field>
            <Field label="Descrição">
              <textarea className="input" value={form.descricao} onChange={set('descricao')} placeholder="Conteúdos e objetivos da disciplina" />
            </Field>
            <Field label="Carga horária (horas)" error={erros.carga_horaria}>
              <input className="input" type="number" min="1" value={form.carga_horaria} onChange={set('carga_horaria')} placeholder="Ex.: 80" />
            </Field>
            <div className="disc-actions">
              <Button variant="secondary" onClick={limpar}>
                {editId ? 'Cancelar' : 'Limpar'}
              </Button>
              <Button type="submit" icon="check" disabled={salvando}>
                {editId ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <Toast message={toast.message} onDone={toast.clear} />
    </>
  )
}
