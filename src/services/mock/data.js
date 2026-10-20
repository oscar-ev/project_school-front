// Dados de exemplo usados enquanto a API não está disponível.
// Os campos seguem exatamente o modelo de dados do backend.

export const alunos = [
  { id: 1, nome: 'Ana Clara Ribeiro', cpf: '52748291703', data_nascimento: '2009-03-14', email: 'ana.ribeiro@email.com', telefone: '11984123301', data_cadastro: '2026-02-02' },
  { id: 2, nome: 'Bruno Martins', cpf: '31810533482', data_nascimento: '2010-08-27', email: 'bruno.martins@email.com', telefone: '11972301144', data_cadastro: '2026-02-02' },
  { id: 3, nome: 'Beatriz Lima', cpf: '74092061115', data_nascimento: '2009-11-05', email: 'beatriz.lima@email.com', telefone: '11966550192', data_cadastro: '2026-02-03' },
  { id: 4, nome: 'Davi Oliveira', cpf: '20937750861', data_nascimento: '2008-01-19', email: 'davi.oliveira@email.com', telefone: '11991207783', data_cadastro: '2026-01-30' },
  { id: 5, nome: 'Eduarda Santos', cpf: '61564822074', data_nascimento: '2010-06-30', email: 'eduarda.santos@email.com', telefone: '11980034521', data_cadastro: '2026-02-05' },
  { id: 6, nome: 'Felipe Costa', cpf: '83221190626', data_nascimento: '2008-09-12', email: 'felipe.costa@email.com', telefone: '11977816630', data_cadastro: '2026-01-30' },
  { id: 7, nome: 'Lucas Andrade', cpf: '47555914318', data_nascimento: '2009-04-22', email: 'lucas.andrade@email.com', telefone: '11961208874', data_cadastro: '2026-02-02' },
  { id: 8, nome: 'Manuela Rocha', cpf: '16983470257', data_nascimento: '2010-12-08', email: 'manuela.rocha@email.com', telefone: '11996542210', data_cadastro: '2026-02-04' },
  { id: 9, nome: 'Rafael Pereira', cpf: '93040388540', data_nascimento: '2007-02-16', email: 'rafael.pereira@email.com', telefone: '11988771056', data_cadastro: '2025-02-10' },
  { id: 10, nome: 'Gabriel Souza', cpf: '05877125093', data_nascimento: '2009-07-02', email: 'gabriel.souza@email.com', telefone: '11993348810', data_cadastro: '2026-02-02' },
  { id: 11, nome: 'Isabela Ferreira', cpf: '38231608471', data_nascimento: '2009-10-28', email: 'isabela.ferreira@email.com', telefone: '11985570023', data_cadastro: '2026-02-02' },
  { id: 12, nome: 'Pedro Almeida', cpf: '72990462184', data_nascimento: '2009-05-17', email: 'pedro.almeida@email.com', telefone: '11974415598', data_cadastro: '2026-02-03' },
  { id: 13, nome: 'Sofia Carvalho', cpf: '14523859726', data_nascimento: '2009-01-09', email: 'sofia.carvalho@email.com', telefone: '11967782241', data_cadastro: '2026-02-03' },
  { id: 14, nome: 'Thiago Barbosa', cpf: '26768741035', data_nascimento: '2009-08-31', email: 'thiago.barbosa@email.com', telefone: '11990126645', data_cadastro: '2026-02-03' },
  { id: 15, nome: 'Júlia Mendonça', cpf: '59312078466', data_nascimento: '2008-03-21', email: 'julia.mendonca@email.com', telefone: '11982245517', data_cadastro: '2026-01-31' },
  { id: 16, nome: 'Mateus Teixeira', cpf: '40678215930', data_nascimento: '2009-12-14', email: 'mateus.teixeira@email.com', telefone: '11973309982', data_cadastro: '2026-02-04' },
  { id: 17, nome: 'Larissa Gomes', cpf: '87145320619', data_nascimento: '2010-02-25', email: 'larissa.gomes@email.com', telefone: '11968840137', data_cadastro: '2026-02-05' },
  { id: 18, nome: 'Vinícius Prado', cpf: '31009684752', data_nascimento: '2008-06-06', email: 'vinicius.prado@email.com', telefone: '11995563308', data_cadastro: '2026-01-30' },
]

export const professores = [
  { id: 1, nome: 'Carla Mendes', cpf: '64131844205', email: 'carla.mendes@saber.edu.br', especialidade: 'Matemática', data_contratacao: '2018-02-10', ativo: true },
  { id: 2, nome: 'Ricardo Alves', cpf: '19220791583', email: 'ricardo.alves@saber.edu.br', especialidade: 'Física', data_contratacao: '2020-08-03', ativo: true },
  { id: 3, nome: 'Fernanda Dias', cpf: '50766412037', email: 'fernanda.dias@saber.edu.br', especialidade: 'Biologia', data_contratacao: '2019-02-15', ativo: true },
  { id: 4, nome: 'João Batista', cpf: '87359087391', email: 'joao.batista@saber.edu.br', especialidade: 'História', data_contratacao: '2015-03-01', ativo: false },
  { id: 5, nome: 'Luciana Freitas', cpf: '23414230688', email: 'luciana.freitas@saber.edu.br', especialidade: 'Língua Inglesa', data_contratacao: '2021-01-22', ativo: true },
  { id: 6, nome: 'Paulo Henrique', cpf: '45887349160', email: 'paulo.henrique@saber.edu.br', especialidade: 'Língua Portuguesa', data_contratacao: '2017-02-05', ativo: true },
  { id: 7, nome: 'Silvia Moreira', cpf: '96542506812', email: 'silvia.moreira@saber.edu.br', especialidade: 'Geografia', data_contratacao: '2022-07-12', ativo: true },
  { id: 8, nome: 'Tiago Nunes', cpf: '38003675249', email: 'tiago.nunes@saber.edu.br', especialidade: 'Química', data_contratacao: '2024-02-01', ativo: true },
]

export const disciplinas = [
  { id: 1, nome: 'Matemática', descricao: 'Álgebra, geometria, funções e estatística.', carga_horaria: 160 },
  { id: 2, nome: 'Língua Portuguesa', descricao: 'Gramática, interpretação e produção de texto.', carga_horaria: 160 },
  { id: 3, nome: 'Física', descricao: 'Mecânica, termologia, óptica e eletricidade.', carga_horaria: 80 },
  { id: 4, nome: 'Química', descricao: 'Matéria, reações e química orgânica.', carga_horaria: 80 },
  { id: 5, nome: 'Biologia', descricao: 'Citologia, genética, ecologia e evolução.', carga_horaria: 80 },
  { id: 6, nome: 'História', descricao: 'História geral e do Brasil.', carga_horaria: 80 },
  { id: 7, nome: 'Geografia', descricao: 'Geografia física, humana e geopolítica.', carga_horaria: 80 },
  { id: 8, nome: 'Língua Inglesa', descricao: 'Leitura, escrita e conversação.', carga_horaria: 80 },
]

export const turmas = [
  { id: 1, nome: '1º ano A', ano_letivo: 2026, turno: 'manha', capacidade: 40 },
  { id: 2, nome: '1º ano B', ano_letivo: 2026, turno: 'tarde', capacidade: 40 },
  { id: 3, nome: '2º ano A', ano_letivo: 2026, turno: 'manha', capacidade: 40 },
  { id: 4, nome: '2º ano B', ano_letivo: 2026, turno: 'noite', capacidade: 35 },
  { id: 5, nome: '3º ano A', ano_letivo: 2026, turno: 'manha', capacidade: 40 },
  { id: 6, nome: '3º ano B', ano_letivo: 2026, turno: 'noite', capacidade: 35 },
  { id: 7, nome: '3º ano A', ano_letivo: 2025, turno: 'manha', capacidade: 40 },
]

export const matriculas = [
  { id: 1, aluno_id: 1, turma_id: 3, data_matricula: '2026-02-02', status: 'ativa' },
  { id: 2, aluno_id: 2, turma_id: 1, data_matricula: '2026-02-02', status: 'ativa' },
  { id: 3, aluno_id: 3, turma_id: 4, data_matricula: '2026-02-03', status: 'trancada' },
  { id: 4, aluno_id: 4, turma_id: 5, data_matricula: '2026-01-30', status: 'ativa' },
  { id: 5, aluno_id: 5, turma_id: 2, data_matricula: '2026-02-05', status: 'ativa' },
  { id: 6, aluno_id: 6, turma_id: 6, data_matricula: '2026-01-30', status: 'cancelada' },
  { id: 7, aluno_id: 7, turma_id: 3, data_matricula: '2026-02-02', status: 'ativa' },
  { id: 8, aluno_id: 8, turma_id: 1, data_matricula: '2026-02-04', status: 'ativa' },
  { id: 9, aluno_id: 9, turma_id: 7, data_matricula: '2025-02-10', status: 'concluida' },
  { id: 10, aluno_id: 10, turma_id: 3, data_matricula: '2026-02-02', status: 'ativa' },
  { id: 11, aluno_id: 11, turma_id: 3, data_matricula: '2026-02-02', status: 'ativa' },
  { id: 12, aluno_id: 12, turma_id: 3, data_matricula: '2026-02-03', status: 'ativa' },
  { id: 13, aluno_id: 13, turma_id: 3, data_matricula: '2026-02-03', status: 'ativa' },
  { id: 14, aluno_id: 14, turma_id: 3, data_matricula: '2026-02-03', status: 'ativa' },
  { id: 15, aluno_id: 15, turma_id: 6, data_matricula: '2026-01-31', status: 'ativa' },
  { id: 16, aluno_id: 16, turma_id: 4, data_matricula: '2026-02-04', status: 'ativa' },
  { id: 17, aluno_id: 17, turma_id: 2, data_matricula: '2026-02-05', status: 'ativa' },
  { id: 18, aluno_id: 18, turma_id: 5, data_matricula: '2026-01-30', status: 'ativa' },
]

let notaId = 0
const lancar = (data_avaliacao, tipo_avaliacao, disciplina_id, professor_id, valores) =>
  Object.entries(valores).map(([aluno_id, valor]) => ({
    id: ++notaId,
    aluno_id: Number(aluno_id),
    disciplina_id,
    professor_id,
    valor,
    tipo_avaliacao,
    data_avaliacao,
  }))

export const notas = [
  // 2º ano A · Matemática
  ...lancar('2026-08-25', 'prova', 1, 1, { 1: 8.0, 7: 5.0, 10: 6.5, 11: 8.5, 12: 5.5, 13: 7.5, 14: 7.0 }),
  ...lancar('2026-09-15', 'atividade', 1, 1, { 1: 9.5, 7: 6.5, 10: 8.0, 11: 9.0, 12: 7.5, 13: 9.0, 14: 9.0 }),
  ...lancar('2026-09-28', 'trabalho', 1, 1, { 1: 9.0, 7: 6.0, 10: 7.5, 11: 8.5, 12: 7.0, 13: 8.0, 14: 8.5 }),
  // 1º ano A e B · Língua Portuguesa
  ...lancar('2026-09-22', 'prova', 2, 6, { 2: 7.5, 8: 8.0, 5: 6.5, 17: 7.0 }),
  // 3º ano A · Física
  ...lancar('2026-10-17', 'trabalho', 3, 2, { 4: 8.0, 18: 8.5 }),
  // 2º ano B e 3º ano B · Biologia
  ...lancar('2026-10-06', 'prova', 5, 3, { 16: 5.5, 15: 6.0 }),
]
