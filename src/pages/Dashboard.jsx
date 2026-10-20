import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import DataTable from '../components/DataTable.jsx'
import { Badge, Card, Person, StatCard } from '../components/ui.jsx'
import { byId, latestMatriculaByAluno, useCollection } from '../hooks/useCollection.js'
import { alunosApi, disciplinasApi, matriculasApi, notasApi, professoresApi, turmasApi } from '../services/index.js'
import { average, formatDate, formatNota } from '../utils/format.js'
import { statusMatricula, tipoAvaliacao } from '../utils/labels.js'
import { getSession } from '../services/session.js'
import './Dashboard.css'

const anoAtual = new Date().getFullYear()
const plural = (n, palavra) => `${n} ${palavra}${n === 1 ? '' : 's'}`
const hojeExtenso = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
const hoje = hojeExtenso[0].toUpperCase() + hojeExtenso.slice(1)

export default function Dashboard() {
  const alunos = useCollection(alunosApi)
  const professores = useCollection(professoresApi)
  const turmas = useCollection(turmasApi)
  const matriculas = useCollection(matriculasApi)
  const notas = useCollection(notasApi)
  const disciplinas = useCollection(disciplinasApi)

  const session = getSession()
  const primeiroNome = session?.nome.split(' ')[0]

  const view = useMemo(() => {
    const alunoMap = byId(alunos.data)
    const turmaMap = byId(turmas.data)
    const profMap = byId(professores.data)
    const discMap = byId(disciplinas.data)
    const matAtual = latestMatriculaByAluno(matriculas.data)

    const turmasAno = turmas.data.filter((t) => t.ano_letivo === anoAtual)
    const ativas = matriculas.data.filter((m) => m.status === 'ativa')

    const mediaPorTurma = turmasAno
      .map((t) => {
        const alunosTurma = new Set(ativas.filter((m) => m.turma_id === t.id).map((m) => m.aluno_id))
        const media = average(notas.data.filter((n) => alunosTurma.has(n.aluno_id)).map((n) => n.valor))
        return { turma: t, media }
      })
      .filter((x) => x.media !== null)

    const ultimasMatriculas = [...matriculas.data]
      .sort((a, b) => b.data_matricula.localeCompare(a.data_matricula) || b.id - a.id)
      .slice(0, 4)
      .map((m) => ({ ...m, aluno: alunoMap[m.aluno_id], turma: turmaMap[m.turma_id] }))

    const ultimasNotas = [...notas.data]
      .sort((a, b) => b.data_avaliacao.localeCompare(a.data_avaliacao) || b.id - a.id)
      .slice(0, 5)
      .map((n) => ({
        ...n,
        aluno: alunoMap[n.aluno_id],
        turma: turmaMap[matAtual[n.aluno_id]?.turma_id],
        professor: profMap[n.professor_id],
        disciplina: discMap[n.disciplina_id],
      }))

    return {
      totalAlunos: alunos.data.length,
      profAtivos: professores.data.filter((p) => p.ativo).length,
      profInativos: professores.data.filter((p) => !p.ativo).length,
      turmasAno,
      capacidade: turmasAno.reduce((s, t) => s + Number(t.capacidade || 0), 0),
      ativas: ativas.length,
      trancadas: matriculas.data.filter((m) => m.status === 'trancada').length,
      canceladas: matriculas.data.filter((m) => m.status === 'cancelada').length,
      mediaPorTurma,
      ultimasMatriculas,
      ultimasNotas,
    }
  }, [alunos.data, professores.data, turmas.data, matriculas.data, notas.data, disciplinas.data])

  const loading = [alunos, professores, turmas, matriculas, notas, disciplinas].some((c) => c.loading)
  const maxMedia = 10

  return (
    <>
      <Topbar
        title={primeiroNome ? `Olá, ${primeiroNome}` : 'Início'}
        sub={`${hoje} · Ano letivo ${anoAtual}`}
      />

      <div className="stats">
        <StatCard label="Alunos cadastrados" value={loading ? '—' : view.totalAlunos} detail="Total na base" icon="aluno" />
        <StatCard
          label="Professores ativos"
          value={loading ? '—' : view.profAtivos}
          detail={plural(view.profInativos, 'inativo')}
          icon="professor"
        />
        <StatCard
          label={`Turmas em ${anoAtual}`}
          value={loading ? '—' : view.turmasAno.length}
          detail={`Capacidade total: ${view.capacidade}`}
          icon="turma"
        />
        <StatCard
          label="Matrículas ativas"
          value={loading ? '—' : view.ativas}
          detail={`${plural(view.trancadas, 'trancada')} · ${plural(view.canceladas, 'cancelada')}`}
          icon="matricula"
        />
      </div>

      <div className="dash-row">
        <Card
          title="Média das notas por turma"
          sub={`Todas as avaliações lançadas em ${anoAtual}`}
          actions={
            <div className="legend">
              <span>
                <i className="dot" style={{ background: 'var(--color-primary)' }} /> 6,0 ou mais
              </span>
              <span>
                <i className="dot" style={{ background: 'var(--color-accent)' }} /> Abaixo de 6,0
              </span>
            </div>
          }
        >
          {view.mediaPorTurma.length === 0 ? (
            <p className="empty-state">{loading ? 'Carregando…' : 'Nenhuma nota lançada ainda.'}</p>
          ) : (
            <div className="bars" role="img" aria-label="Gráfico de média das notas por turma">
              {view.mediaPorTurma.map(({ turma, media }) => (
                <div key={turma.id} className="bar-col">
                  <span className="bar-value">{formatNota(media)}</span>
                  <span
                    className={`bar ${media < 6 ? 'low' : ''}`}
                    style={{ height: `${(media / maxMedia) * 180}px` }}
                    title={`${turma.nome}: ${formatNota(media)}`}
                  />
                  <span className="bar-label">{turma.nome}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Últimas matrículas"
          className="dash-side"
          actions={
            <Link to="/matriculas" className="btn btn-ghost">
              Ver todas
            </Link>
          }
        >
          {view.ultimasMatriculas.map((m) => {
            const st = statusMatricula(m.status)
            return (
              <div key={m.id} className="dash-item">
                <Person
                  name={m.aluno?.nome ?? `Aluno #${m.aluno_id}`}
                  sub={`${m.turma?.nome ?? '—'} · ${formatDate(m.data_matricula)}`}
                />
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
            )
          })}
          {!loading && view.ultimasMatriculas.length === 0 && <p className="empty-state">Nenhuma matrícula.</p>}
        </Card>
      </div>

      <Card
        flush
        title="Últimas notas lançadas"
        actions={
          <Link to="/notas" className="btn btn-secondary">
            Lançar notas
          </Link>
        }
      >
        <DataTable
          loading={loading}
          rows={view.ultimasNotas}
          empty="Nenhuma nota lançada ainda."
          columns={[
            { key: 'aluno', label: 'Aluno', render: (n) => <Person name={n.aluno?.nome ?? '—'} sub={n.turma?.nome} /> },
            { key: 'disciplina', label: 'Disciplina', render: (n) => n.disciplina?.nome ?? '—' },
            { key: 'professor', label: 'Professor', render: (n) => n.professor?.nome ?? '—' },
            {
              key: 'tipo',
              label: 'Avaliação',
              render: (n) => {
                const t = tipoAvaliacao(n.tipo_avaliacao)
                return <Badge tone={t.tone}>{t.label}</Badge>
              },
            },
            { key: 'data', label: 'Data', render: (n) => formatDate(n.data_avaliacao) },
            {
              key: 'valor',
              label: 'Nota',
              className: 'num',
              render: (n) => <strong className={n.valor < 6 ? 'text-danger' : ''}>{formatNota(n.valor)}</strong>,
            },
          ]}
        />
      </Card>
    </>
  )
}
