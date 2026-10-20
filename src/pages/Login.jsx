import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { Button, Field } from '../components/ui.jsx'
import { login } from '../services/session.js'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@') || senha.length < 4) {
      setError('Informe um e-mail válido e a senha.')
      return
    }
    login(email)
    navigate('/')
  }

  return (
    <div className="login">
      <section className="login-brand">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="aluno" />
          </span>
          <span className="brand-name">Escola Saber</span>
        </div>
        <h1 className="login-headline">
          Toda a escola
          <br />
          em um só lugar.
        </h1>
        <p className="login-text">
          Alunos, professores, turmas, matrículas e notas organizados para a secretaria e a coordenação.
        </p>
      </section>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div>
            <h2 className="login-title">Entrar</h2>
            <p className="muted">Use seu e-mail institucional para acessar.</p>
          </div>
          <Field label="E-mail">
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="nome@escola.edu.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Senha">
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </Field>
          {error && <div className="alert">{error}</div>}
          <div className="login-options">
            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              Lembrar de mim
            </label>
            <button type="button" className="login-link">
              Esqueci a senha
            </button>
          </div>
          <Button type="submit" block>
            Entrar
          </Button>
          <p className="muted" style={{ fontSize: 13 }}>
            Problemas para acessar? Fale com a secretaria.
          </p>
        </form>
      </div>
    </div>
  )
}
