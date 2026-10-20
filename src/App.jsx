import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Alunos from './pages/Alunos.jsx'
import Professores from './pages/Professores.jsx'
import Turmas from './pages/Turmas.jsx'
import Disciplinas from './pages/Disciplinas.jsx'
import Matriculas from './pages/Matriculas.jsx'
import Notas from './pages/Notas.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="professores" element={<Professores />} />
        <Route path="turmas" element={<Turmas />} />
        <Route path="disciplinas" element={<Disciplinas />} />
        <Route path="matriculas" element={<Matriculas />} />
        <Route path="notas" element={<Notas />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
