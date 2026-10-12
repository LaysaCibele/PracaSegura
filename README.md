# PraçaSegura

Plataforma web para consulta e acompanhamento de praças públicas e ocorrências cadastradas no Recife, desenvolvida a partir do desafio **“Ampliação da segurança em praças públicas via tecnologia”**, da Prefeitura do Recife.

O projeto busca centralizar informações sobre ocorrências em espaços públicos, facilitando o acompanhamento pelos cidadãos e apoiando a gestão municipal.

## 1. Sobre o projeto

O PraçaSegura permite consultar praças, registrar ocorrências associadas a esses espaços e acompanhar o andamento dos registros. A aplicação possui perfis de cidadão e gestor, com permissões diferentes para proteger as operações administrativas.

A proposta também prevê uma futura camada de Ciência de Dados para analisar informações públicas sobre iluminação, infraestrutura urbana e outros indicadores relevantes, conforme a disponibilidade e a qualidade dos dados.

**Escopo atual:** aplicação web com React, Spring Boot e PostgreSQL. A implementação da camada analítica ainda está planejada.

## 2. Funcionalidades implementadas

### Cidadão

* Cadastro de conta, login e logout por sessão.
* Consulta pública das praças disponíveis.
* Registro de ocorrências por usuários autenticados.
* Associação de cada ocorrência à praça selecionada no formulário.
* Consulta autenticada de ocorrências de todas as praças ou filtradas por uma praça específica.
* Consulta individual limitada às próprias ocorrências.
* Acompanhamento do status das ocorrências.

### Gestor

* Consulta de praças e gerenciamento por meio de criação, edição e exclusão.
* Consulta de ocorrências de diferentes praças.
* Filtragem das ocorrências por praça.
* Dashboard com indicadores por status e categoria, filtráveis pela praça selecionada.
* Consulta individual de ocorrências.
* Atualização do status dos registros.

### Segurança e integridade dos dados

* O cadastro público cria contas com perfil de cidadão.
* As operações administrativas de praças e a alteração do status das ocorrências são restritas ao gestor.
* O autor, a praça associada e a data de criação da ocorrência são definidos pelo servidor durante o registro.
* As respostas das ocorrências utilizam DTOs, evitando a exposição de senha, e-mail e nome do autor.
* A listagem geral de ocorrências e o dashboard exigem autenticação.

## 3. Tecnologias utilizadas

| Camada             | Tecnologias                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Frontend           | React 19.3.0, JavaScript, React Router 7.18.4 e CSS                                            |
| Backend            | Java 21, Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA, Spring Security e Bean Validation |
| Banco de dados     | PostgreSQL                                                                                     |
| Build do backend   | Maven e Maven Wrapper                                                                          |
| Controle de versão | Git e GitHub                                                                                   |

As versões indicadas devem ser conferidas nos arquivos de configuração do projeto caso sejam alteradas durante o desenvolvimento.

## 4. Arquitetura

A aplicação segue uma arquitetura cliente-servidor, organizada em três camadas principais:

1. **Frontend — React:** apresenta as interfaces, recebe as interações e realiza chamadas à API.
2. **Backend — Spring Boot:** disponibiliza os endpoints REST, aplica as regras de negócio, valida as requisições e controla as permissões.
3. **Banco de dados — PostgreSQL:** armazena as informações persistentes utilizadas pela aplicação.

O frontend utiliza o prefixo `/api` para encaminhar as chamadas ao backend, configurado por padrão em `http://localhost:8080`.

A futura camada de Ciência de Dados será integrada à arquitetura após o levantamento e a avaliação das fontes disponíveis.

## 5. Rotas da API

As rotas abaixo descrevem o contrato previsto para a aplicação. Os acessos indicados devem corresponder às regras efetivamente aplicadas no backend.

| Método e rota                              | Acesso              | Finalidade                            |
| ------------------------------------------ | ------------------- | ------------------------------------- |
| `POST /api/auth/register`                  | Público             | Cadastrar conta de cidadão            |
| `POST /api/auth/login`                     | Público             | Iniciar sessão                        |
| `GET /api/auth/me`                         | Autenticado         | Consultar o perfil da sessão          |
| `POST /api/auth/logout`                    | Autenticado         | Encerrar sessão                       |
| `GET /api/health`                          | Público             | Verificar a disponibilidade da API    |
| `GET /api/squares`                         | Público             | Listar praças                         |
| `GET /api/squares/{id}`                    | Público             | Consultar uma praça                   |
| `POST /api/squares`                        | Gestor              | Criar praça                           |
| `PUT /api/squares/{id}`                    | Gestor              | Editar praça                          |
| `DELETE /api/squares/{id}`                 | Gestor              | Excluir praça                         |
| `GET /api/occurrences`                     | Autenticado         | Listar ocorrências de todas as praças |
| `GET /api/occurrences?squareId={id}`       | Autenticado         | Filtrar ocorrências por praça         |
| `GET /api/occurrences/stats`               | Autenticado         | Consultar indicadores gerais          |
| `GET /api/occurrences/stats?squareId={id}` | Autenticado         | Consultar indicadores de uma praça    |
| `GET /api/occurrences/{id}`                | Autor ou gestor     | Consultar ocorrência individual       |
| `POST /api/occurrences?squareId={id}`      | Cidadão autenticado | Registrar ocorrência                  |
| `PATCH /api/occurrences/{id}/status`       | Gestor              | Atualizar status da ocorrência        |

O cadastro público não permite escolher o perfil de gestor. Os dados pessoais do autor não devem ser expostos nas respostas destinadas à consulta de ocorrências.

## 6. Como executar localmente

### Pré-requisitos

* Git.
* Node.js e npm.
* Java 21.
* PostgreSQL.
* Maven instalado ou Maven Wrapper disponível no repositório.

### 6.1. Clonar o repositório


```bash
git clone <https://github.com/LaysaCibele/PracaSegura.git>
cd praca-segura
```

### 6.2. Configurar o banco de dados

Crie uma instância e um banco PostgreSQL e configure a URL de conexão, o usuário e a senha conforme as propriedades do backend em:

`backend/src/main/resources/application.properties`

Não publique credenciais reais no repositório. Prefira variáveis de ambiente ou outra configuração local segura, conforme o suporte implementado pelo projeto.

### 6.3. Iniciar o backend

Em um terminal, execute:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

O backend utiliza, por padrão, a porta `8080`, salvo configuração diferente.

### 6.4. Iniciar o frontend

Em outro terminal, na raiz do repositório:

```bash
cd frontend
npm install
npm start
```

O frontend React geralmente estará disponível em `http://localhost:3000`.

Mantenha o backend em execução para que as chamadas `/api` possam ser atendidas.

**Docker:** o repositório não possui atualmente um arquivo Docker Compose documentado como fluxo pronto para executar a aplicação e o banco de dados.

## 7. Testes e validação

### Frontend

Na pasta `frontend`, execute:

```bash
npm test -- --watchAll=false
npm run build
```

### Backend

Na pasta `backend`, execute no Windows:

```powershell
.\mvnw.cmd test
```

Os testes de backend descritos para o projeto abrangem consulta geral e filtrada de ocorrências, restrições de consulta individual, atualização de status, contrato dos DTOs e definição de autor, praça e data pelo servidor.

A execução dos comandos deve ser realizada antes de declarar a versão validada. Registre eventuais falhas, dependências necessárias e correções pendentes.

### Verificação funcional

Além dos testes automatizados, confira manualmente:

* Cadastro, login e logout.
* Consulta e administração de praças.
* Registro e consulta de ocorrências.
* Filtros por praça e sincronização com o dashboard.
* Permissões de cidadão e gestor.
* Integridade dos dados retornados pela API.

## 8. Ciência de Dados — próxima etapa

A camada de Ciência de Dados **ainda não está implementada**. Não há, nesta versão, pipeline analítico, modelo preditivo, índice de segurança validado ou integração com bases públicas.

A próxima fase está planejada para incluir:

1. **Levantamento de dados públicos:** pesquisar fontes oficiais sobre iluminação pública, infraestrutura urbana, praças e outros indicadores relevantes do Recife.
2. **Avaliação das fontes:** verificar licença, cobertura geográfica, atualização, qualidade, disponibilidade e possibilidade de relacionar os dados às praças.
3. **Preparação e análise exploratória:** tratar valores ausentes, duplicidades e inconsistências; integrar as fontes compatíveis e analisar os dados.
4. **Definição metodológica:** determinar quais indicadores podem ser calculados ou quais modelos podem ser construídos com os dados realmente disponíveis.
5. **Implementação e validação:** desenvolver a solução analítica, definir métricas adequadas e documentar resultados e limitações.
6. **Integração com a aplicação:** disponibilizar os resultados por meio do backend e apresentá-los no frontend, quando tecnicamente viável.
7. **Documentação:** registrar fontes, decisões de tratamento, metodologia, testes e instruções para reproduzir a análise.

A escolha entre indicadores, análise espacial, métodos não supervisionados ou aprendizado supervisionado dependerá das características das bases encontradas e da existência de dados adequados para validar a abordagem.

Estimativas analíticas não devem ser tratadas como comprovação de criminalidade ou de risco real. Correlações entre iluminação, infraestrutura e ocorrências, por exemplo, não demonstram por si só relações causais.

## 9. Privacidade e responsabilidade

O PraçaSegura deve aplicar as permissões definidas para cada perfil e evitar a exposição desnecessária de dados pessoais.

A futura camada analítica deverá utilizar os dados de forma responsável, documentar limitações e respeitar as condições de uso das fontes. A interpretação dos resultados deverá considerar a qualidade, a cobertura e possíveis vieses dos dados.

## 10. Estrutura principal do repositório

```text
praca-segura/
├── backend/       # API Spring Boot, regras de negócio e persistência
├── frontend/      # Aplicação React, componentes e chamadas à API
├── README.md      # Documentação principal
└── LICENSE        # Licença do código-fonte, se presente
```

A estrutura exata pode variar conforme a organização dos arquivos e a evolução do projeto.

## 11. Licença

O código-fonte é disponibilizado sob a licença MIT, conforme o arquivo `LICENSE`, caso presente no repositório.

Os dados e as imagens utilizados no projeto permanecem sujeitos às licenças e condições de suas fontes originais.

## Autoria

**Laysa Cibele**

Projeto acadêmico desenvolvido a partir do desafio de ampliação da segurança em praças públicas por meio da tecnologia, da Prefeitura do Recife.
