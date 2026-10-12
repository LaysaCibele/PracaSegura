# PraçaSegura

**MVP criado em resposta ao desafio público de ampliar a segurança e o uso das praças do Recife por meio da tecnologia.** A plataforma organiza ocorrências e informações descritivas sobre iluminação para apoiar o acompanhamento dos espaços públicos.

## Sobre o projeto

O PraçaSegura reúne informações de praças públicas do Recife e ocorrências registradas por cidadãos. A aplicação permite acompanhar os registros por praça, enquanto gestores mantêm os cadastros e atualizam o status das ocorrências.

Na página de detalhes de cada praça, a aplicação apresenta a quantidade de registros de iluminação pública localizados dentro do perímetro geográfico mapeado. O inventário não informa se a luminária está funcionando; por isso, o número não é tratado como contagem confirmada de postes únicos nem como medida de segurança.

## Desafio público de origem

O projeto parte do desafio da Prefeitura do Recife **“Ampliação da segurança em praças públicas via tecnologia”**, publicado em 10/12/2025 e apresentado como desafio público em aberto. O cenário descrito relaciona a subutilização de praças à percepção de insegurança e aponta monitoramento e iluminação eficiente como aspectos do problema.

O desafio estabelece como objetivo de longo prazo **aumentar em 40% o uso das praças públicas** por meio de soluções que melhorem a percepção de segurança e promovam a convivência social. Entre os resultados esperados estão maior uso dos espaços, melhoria da sensação de segurança e redução da criminalidade. Os indicadores propostos incluem frequência de usuários, ocorrências criminais, tempo de resposta, percepção de segurança e funcionamento de equipamentos.

O PraçaSegura oferece uma base digital de consulta e acompanhamento que pode apoiar esse objetivo. A meta de 40% e os resultados esperados pertencem ao desafio público: **não foram medidos nem validados por este MVP**. A aplicação não tem dados de frequência de usuários, pesquisa de percepção, registros oficiais de criminalidade ou telemetria que confirme o funcionamento das luminárias. Assim, não é possível afirmar que o sistema já aumentou o uso ou a segurança das praças.

O desafio também identifica riscos como vandalismo, custos de manutenção, privacidade, dependência tecnológica e necessidade de monitoramento contínuo. O tratamento desses riscos depende de medidas operacionais e institucionais além das funcionalidades atuais do MVP.

O desafio relaciona-se aos **ODS 3 — Saúde e bem-estar**, **ODS 11 — Cidades e comunidades sustentáveis** e **ODS 16 — Paz, justiça e instituições eficazes**, conforme a página de origem.

## Funcionalidades

### Cidadãos

- Criar conta, entrar e sair da aplicação.
- Consultar as praças cadastradas e seus detalhes.
- Ver ocorrências de todas as praças ou filtrar por uma praça específica. A consulta exige autenticação.
- Registrar uma ocorrência associada à praça selecionada.
- Acompanhar o status das ocorrências.
- Consultar os detalhes individuais apenas das próprias ocorrências.

### Gestores

- Criar, editar e excluir praças.
- Consultar ocorrências de todas as praças ou filtrar por praça.
- Ver indicadores de ocorrências por status e categoria.
- Atualizar o status de uma ocorrência.
- Consultar os detalhes individuais das ocorrências.

O cadastro público cria contas de cidadão. O servidor define o autor, a praça associada e a data de criação de cada ocorrência. As respostas das ocorrências usam DTOs sem senha ou dados pessoais desnecessários do autor.

## Indicador público de iluminação

O pipeline em `data-science/` cruza os pontos do inventário de iluminação pública de 2025 com os polígonos municipais identificados para as quatro praças. O relatório agregado usado pelo frontend está em `frontend/public/data/urban-indicators.json`.

| Praça | Registros do inventário dentro do perímetro |
| --- | ---: |
| Praça de Casa Forte | 42 |
| Praça de Boa Viagem | 58 |
| Praça do Derby | 227 |
| Parque da Jaqueira | 295 |

O relatório foi gerado em 12/10/2026. Na consulta, o CSV e o índice CKAN informavam 111.666 registros. A fonte é a [EMLURB — Inventário de Iluminação Pública do Recife, 2025](https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife/resource/76cb7e65-1362-4ea7-ac04-453d67e41c64), publicada sob licença [ODbL](https://opendatacommons.org/licenses/odbl/).

As contagens são linhas do inventário localizadas nos polígonos. Elas podem incluir registros repetidos e não indicam funcionamento, intensidade ou cobertura da iluminação. Não existe variável-alvo validada para estimar risco ou criminalidade. Os dados do 156 não são exibidos: a auditoria encontrou divergência entre o tamanho do CSV e o índice CKAN, além de limitações de cobertura geográfica e temporal. Consulte [data-science/README.md](data-science/README.md) para fontes, auditoria, metodologia e limitações.

### Regenerar o relatório espacial

Requer Python 3.11 ou mais recente e acesso à internet. O processo lê os dados públicos em streaming, mantém as linhas brutas em memória e grava somente o relatório agregado.

No PowerShell, a partir da raiz do repositório:

```powershell
$env:PYTHONPATH = "data-science/src"
python -m pracasegura_ds.spatial_audit --sources postes --output frontend/public/data/urban-indicators.json
```

O frontend lê esse JSON estático. Não foi criado um endpoint analítico no backend; o indicador não altera autenticação, permissões nem os dados das ocorrências.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, JavaScript, React Router 7 e CSS |
| Backend | Java 21, Spring Boot 4.1, Spring MVC, Spring Data JPA, Spring Security e Bean Validation |
| Banco de dados | PostgreSQL |
| Ciência de Dados | Python 3.11+, biblioteca padrão; auditoria CSV/CKAN e cruzamento geográfico |
| Testes | React Testing Library/Jest, testes Java com Maven e `unittest` para Python |

As versões exatas estão nos arquivos de configuração do frontend e do backend.

## Arquitetura

```text
React (frontend) ── /api ──> Spring Boot (backend) ──> PostgreSQL
       │
       └── relatório agregado estático de iluminação
           frontend/public/data/urban-indicators.json

Python (data-science) ── Portal de Dados Abertos do Recife
       └── gera o relatório agregado consumido pelo frontend
```

O frontend utiliza o proxy de desenvolvimento para encaminhar `/api` a `http://localhost:8080`. O inventário de iluminação é servido como arquivo estático do frontend; os dados brutos não são persistidos pelo pipeline.

## API principal

| Método e rota | Acesso | Finalidade |
| --- | --- | --- |
| `POST /api/auth/register` | Público | Cadastro de cidadão |
| `POST /api/auth/login` | Público | Iniciar sessão |
| `GET /api/auth/me` | Autenticado | Consultar a sessão atual |
| `POST /api/auth/logout` | Autenticado | Encerrar sessão |
| `GET /api/health` | Público | Verificar disponibilidade |
| `GET /api/squares` e `GET /api/squares/{id}` | Público | Consultar praças |
| `POST`, `PUT`, `DELETE /api/squares...` | Gestor | Administrar praças |
| `GET /api/occurrences` | Autenticado | Consultar ocorrências de todas as praças |
| `GET /api/occurrences?squareId={id}` | Autenticado | Filtrar ocorrências por praça |
| `GET /api/occurrences/stats[?squareId={id}]` | Autenticado | Consultar indicadores de ocorrências |
| `GET /api/occurrences/{id}` | Autor ou gestor | Consultar uma ocorrência |
| `POST /api/occurrences?squareId={id}` | Cidadão autenticado | Registrar ocorrência |
| `PATCH /api/occurrences/{id}/status` | Gestor | Atualizar status |

## Executar localmente

### Pré-requisitos

- Git
- Node.js e npm
- Java 21
- PostgreSQL
- Python 3.11+ (para executar ou regenerar o relatório analítico)

<<<<<<< HEAD
### Clonar o repositório

```bash
git clone https://github.com/LaysaCibele/PracaSegura.git
cd PracaSegura
=======
### 6.1. Clonar o repositório


```bash
git clone <https://github.com/LaysaCibele/PracaSegura.git>
cd praca-segura
>>>>>>> e91fbcf2b5b1696633652f595268003a25fc8529
```

### Configurar e iniciar o backend

Configure a conexão local com PostgreSQL em `backend/src/main/resources/application.properties`. Use credenciais locais e não publique segredos.

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

O backend usa a porta `8080` por padrão.

### Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

A aplicação React fica disponível em `http://localhost:3000`. Mantenha o backend e o PostgreSQL em execução para usar autenticação, ocorrências e dashboard.

**Docker:** o repositório não contém Docker Compose ou Dockerfile configurado como fluxo de execução local.

## Testes

Frontend, na pasta `frontend`:

```bash
npm test -- --watchAll=false
npm run build
```

Backend, na pasta `backend` (Windows):

```powershell
.\mvnw.cmd test
```

Pipeline de Ciência de Dados, na pasta `data-science`:

```powershell
$env:PYTHONPATH = "src"
python -m unittest discover -s tests -v
```

## Segurança e limites

- A listagem de ocorrências e os indicadores do dashboard exigem autenticação; detalhes individuais são limitados ao autor ou ao gestor.
- Cidadãos podem registrar ocorrências; apenas gestores podem administrar praças e alterar status.
- A configuração atual do Spring Security desativa CSRF para o MVP local. Revise essa configuração antes de disponibilizar a aplicação publicamente.
- Os relatos de usuários e o inventário público são fontes descritivas. Não constituem confirmação oficial de fatos, criminalidade ou risco.
- Este repositório não contém modelo de Machine Learning nem classificação de segurança.

## Estrutura do repositório

```text
praca-segura/
├── backend/       # API Spring Boot e persistência
├── frontend/      # Interface React e relatório agregado público
├── data-science/  # Auditoria e análise espacial reproduzível
├── README.md
└── LICENSE


## Autoria e licença

Projeto acadêmico de **Laysa Cibele**, baseado no desafio de ampliação da segurança em praças públicas por tecnologia, da Prefeitura do Recife. O código está sob licença MIT, conforme o arquivo `LICENSE`. Os dados públicos e imagens permanecem sujeitos às licenças de suas fontes.
