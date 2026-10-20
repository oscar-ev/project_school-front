// Sessão provisória: o modelo de dados ainda não tem entidade de usuário,
// então o login só guarda o nome no navegador. Trocar pela autenticação da API quando existir.
const KEY = 'escola-saber:sessao'

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function login(email) {
  const nome = email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ')
  const session = { email, nome: nome || 'Usuário', papel: 'Secretaria' }
  sessionStorage.setItem(KEY, JSON.stringify(session))
  return session
}

export function logout() {
  sessionStorage.removeItem(KEY)
}
