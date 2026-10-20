import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { Avatar, IconButton } from './ui.jsx'
import { getSession, logout } from '../services/session.js'

const sections = [
  { title: 'Principal', items: [{ to: '/', label: 'Início', icon: 'home', end: true }] },
  {
    title: 'Cadastros',
    items: [
      { to: '/alunos', label: 'Alunos', icon: 'aluno' },
      { to: '/professores', label: 'Professores', icon: 'professor' },
      { to: '/turmas', label: 'Turmas', icon: 'turma' },
      { to: '/disciplinas', label: 'Disciplinas', icon: 'disciplina' },
    ],
  },
  {
    title: 'Acadêmico',
    items: [
      { to: '/matriculas', label: 'Matrículas', icon: 'matricula' },
      { to: '/notas', label: 'Notas', icon: 'notas' },
    ],
  },
]

export default function Layout() {
  const navigate = useNavigate()
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="aluno" />
          </span>
          <div>
            <div className="brand-name">Escola Saber</div>
            <div className="brand-sub">Gestão escolar</div>
          </div>
        </div>

        <nav className="nav" aria-label="Menu principal">
          {sections.map((section) => (
            <div key={section.title} className="nav-group">
              <div className="nav-section">{section.title.toUpperCase()}</div>
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <Avatar name={session.nome} />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{session.nome}</div>
            <div className="sidebar-user-role">{session.papel}</div>
          </div>
          <IconButton
            icon="sair"
            label="Sair"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          />
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
