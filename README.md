# project_school-front

Front-end do sistema de gestão escolar (Escola Saber). Consome a API do backend
[`project_school`](https://github.com/devJMSF/project_school).

Feito com **React + Vite** e **React Router**. Sem bibliotecas de UI: os estilos ficam em `src/styles/global.css`.

## Telas

| Rota           | Tela                                                      |
| -------------- | --------------------------------------------------------- |
| `/login`       | Entrada no sistema                                        |
| `/`            | Dashboard com indicadores, médias por turma e atividade recente |
| `/alunos`      | Cadastro e listagem de alunos (com matrícula opcional)    |
| `/professores` | Cadastro e listagem de professores                        |
| `/turmas`      | Turmas por ano letivo e turno, com ocupação               |
| `/disciplinas` | Cadastro de disciplinas                                   |
| `/matriculas`  | Matrículas por status (ativa, trancada, cancelada, concluída) |
| `/notas`       | Lançamento de notas por avaliação                         |

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env
npm run dev
```

Acesse http://localhost:5173. Qualquer e-mail válido e senha com 4+ caracteres entram no sistema.

Outros comandos:

```bash
npm run build    # gera a versão de produção em dist/
npm run preview  # serve o build localmente
npm run lint     # verifica o código
```

## Conectando com a API

Por padrão o front usa **dados simulados** (`src/services/mock/data.js`), então funciona sem o backend.
Para usar a API real, edite o `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

Reinicie o `npm run dev` depois de alterar o `.env`.

Toda a comunicação com o backend fica em `src/services/`:

- `api.js`: cliente HTTP e a versão simulada.
- `index.js`: um cliente por entidade. Se o backend usar outro caminho, troque o nome do endpoint aqui.

### Rotas esperadas

Para cada entidade (`alunos`, `professores`, `disciplinas`, `turmas`, `matriculas`, `notas`):

| Método   | Rota              | Uso                    |
| -------- | ----------------- | ---------------------- |
| `GET`    | `/{entidade}`     | Listar                 |
| `GET`    | `/{entidade}/:id` | Buscar um registro     |
| `POST`   | `/{entidade}`     | Criar                  |
| `PUT`    | `/{entidade}/:id` | Atualizar              |
| `DELETE` | `/{entidade}/:id` | Excluir                |

As respostas devem ser JSON com os mesmos nomes de campo do modelo de dados (abaixo).
Em caso de erro, o front mostra o campo `message`, `detail` ou `error` do corpo da resposta, se existir.

O backend precisa liberar **CORS** para a origem do front (em desenvolvimento, `http://localhost:5173`).

### Modelo de dados

| Entidade      | Campos |
| ------------- | ------ |
| **Aluno**     | `id`, `nome`, `cpf`, `data_nascimento`, `email`, `telefone`, `data_cadastro` |
| **Professor** | `id`, `nome`, `cpf`, `email`, `especialidade`, `data_contratacao`, `ativo` |
| **Disciplina**| `id`, `nome`, `descricao`, `carga_horaria` |
| **Turma**     | `id`, `nome`, `ano_letivo`, `turno`, `capacidade` |
| **Matricula** | `id`, `aluno_id`, `turma_id`, `data_matricula`, `status` |
| **Nota**      | `id`, `aluno_id`, `disciplina_id`, `professor_id`, `valor`, `tipo_avaliacao`, `data_avaliacao` |

Formatos enviados pelo front:

- Datas: `AAAA-MM-DD`.
- `cpf` e `telefone`: só dígitos.
- `turno`: `manha`, `tarde` ou `noite`.
- `status` da matrícula: `ativa`, `trancada`, `cancelada` ou `concluida`.
- `tipo_avaliacao`: `prova`, `trabalho` ou `atividade`.
- `ativo`: booleano. `valor` e `carga_horaria`: números.

Se o backend usar outros valores, ajuste `src/utils/labels.js`.

### Pontos em aberto com o backend

- **Login**: ainda não há entidade de usuário. Por enquanto o login só guarda o nome na sessão do navegador (`src/services/session.js`).
- **Filtros na API**: as listas são filtradas no próprio front. Com muitos registros, vale a API aceitar filtros e paginação (ex.: `GET /matriculas?turma_id=3`).

## Estrutura

```
src/
├── components/   # Layout, menu, tabela, botões, modal e outros componentes
├── hooks/        # useCollection (carregar listas), useToast
├── pages/        # Uma tela por arquivo
├── services/     # Cliente da API, dados simulados e sessão
├── styles/       # Estilos globais e cores
└── utils/        # Formatação (datas, CPF, notas) e rótulos
```
