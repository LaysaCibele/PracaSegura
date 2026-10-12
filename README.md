# PraçaSegura

Aplicação web para consulta e acompanhamento de praças públicas e ocorrências cadastradas no Recife. O projeto está em desenvolvimento e, nesta etapa, o escopo é a aplicação web com React, Spring Boot e PostgreSQL.

## Funcionalidades implementadas

- Cadastro de conta de cidadão, login e logout por sessão.
- Consulta pública das praças; criação, edição e exclusão de praças restritas ao gestor.
- Cadastro de praça com URL direta opcional para imagem, exibida na vitrine e na prévia da gestão.
- Registro de ocorrência por cidadão autenticado, vinculada à praça selecionada no formulário.
- Consulta autenticada de ocorrências de todas as praças ou filtradas por praça.
- Dashboard com totais por status e categoria, filtráveis pela praça selecionada.
- Atualização do status de ocorrências e consulta de ocorrências individuais pelo gestor.
- Consulta individual pelo cidadão limitada às ocorrências que ele registrou.
- Respostas de ocorrências por DTO, sem incluir senha, e-mail ou nome de quem registrou.
- Data de criação, praça, autor e status inicial definidos pelo servidor ao registrar uma ocorrência.

O cadastro público sempre cria uma conta com perfil de cidadão. O perfil de gestor é necessário para administrar praças e alterar status de ocorrências. A listagem geral e o dashboard exigem autenticação; os dados de autor não são exibidos.

## Rotas da API

| Método e rota | Acesso | Uso |
| --- | --- | --- |
| `POST /api/auth/register` | Público | Cria conta de cidadão |
| `POST /api/auth/login` | Público | Inicia sessão |
| `GET /api/auth/me` | Autenticado | Retorna o perfil da sessão |
| `POST /api/auth/logout` | Autenticado | Encerra sessão |
| `GET /api/health` | Público | Verifica disponibilidade da API |
| `GET /api/squares`, `GET /api/squares/{id}` | Público | Consulta praças |
| `POST /api/squares`, `PUT /api/squares/{id}`, `DELETE /api/squares/{id}` | Gestor | Administra praças |
| `GET /api/occurrences` | Autenticado | Lista ocorrências de todas as praças |
| `GET /api/occurrences?squareId={id}` | Autenticado | Filtra ocorrências pela praça |
| `GET /api/occurrences/stats` | Autenticado | Consulta indicadores gerais |
| `GET /api/occurrences/stats?squareId={id}` | Autenticado | Consulta indicadores da praça |
| `GET /api/occurrences/{id}` | Autor ou gestor | Consulta uma ocorrência individual |
| `POST /api/occurrences?squareId={id}` | Cidadão | Registra uma ocorrência |
| `PATCH /api/occurrences/{id}/status` | Gestor | Atualiza o status da ocorrência |

## Tecnologias e execução local

- Frontend: React `19.3.0`, JavaScript, React Router `7.18.4` e CSS (dependências conforme `frontend/package.json`).
- Backend: Java `21`, Spring Boot `4.1.1`, Spring Web MVC, Spring Data JPA, Spring Security e Bean Validation.
- Banco: PostgreSQL, configurado pelo backend em `backend/src/main/resources/application.properties`.
- O frontend usa o proxy `/api` para encaminhar chamadas ao backend em `http://localhost:8080`.

Configure uma instância PostgreSQL e os parâmetros de conexão locais no arquivo de configuração do backend. Não compartilhe credenciais. Inicie o backend na porta 8080 e, em outro terminal, execute:

```bash
cd frontend
npm install
npm start
```

O repositório não contém atualmente um arquivo Docker Compose; portanto, a configuração do PostgreSQL via Docker não está documentada como fluxo pronto.

## Testes e validação

Na pasta `frontend`, execute `npm test -- --watchAll=false` e `npm run build`. Na pasta `backend`, execute `mvn test` com Maven e dependências disponíveis. Os testes backend cobrem consulta geral e filtrada, restrições de consulta individual e atualização de status, contrato do DTO e definição de autor, praça e data no serviço.

## Ciência de Dados — planejada

Não há pipeline, modelo, índice de segurança ou integração analítica implementados nesta versão. A pesquisa e avaliação de fontes públicas, a análise exploratória, a metodologia e a integração de resultados são etapas futuras e não devem ser interpretadas como funcionalidades disponíveis.

## Estrutura principal

```text
backend/   API Spring Boot, regras de negócio e persistência
frontend/  Aplicação React, componentes, páginas e chamadas da API
README.md  Documentação do projeto
```

## Licença

O código-fonte está disponibilizado sob a licença MIT (consulte `LICENSE`). Os dados e imagens cadastrados permanecem sujeitos às licenças e condições de suas fontes originais.
