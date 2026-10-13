# PraçaSegura

MVP acadêmico desenvolvido a partir do desafio público da Prefeitura do Recife **“Ampliação da segurança em praças públicas via tecnologia”**. O projeto reúne informações de espaços públicos, relatos de cidadãos e dados de iluminação para apoiar o acompanhamento e a gestão de praças e parques.

O desafio estabelece a meta de aumentar em 40% o uso das praças. Esse percentual não representa um resultado medido pelo PraçaSegura.

## Funcionalidades

**Visitantes**
- Explorar praças e parques cadastrados.
- Consultar recomendações resumidas dos espaços.
- Criar uma conta para registrar e acompanhar relatos.

**Cidadãos autenticados**
- Registrar ocorrências e consultar apenas os próprios relatos.
- Acompanhar o status dos registros.

**Gestores**
- Consultar e filtrar ocorrências de todas as praças.
- Visualizar indicadores operacionais e atualizar status.
- Cadastrar, editar e excluir espaços públicos.
- Consultar dados agregados de iluminação.

As permissões são aplicadas no backend. O cadastro público cria contas de cidadão; gestores precisam ser provisionados administrativamente.

## Recomendação dos espaços

Cada espaço pode apresentar uma nota de 0 a 100, calculada a partir de ocorrências reais agregadas: registros resolvidos aumentam a nota, enquanto registros da categoria **Segurança** a reduzem.

Quando não há dados suficientes, o sistema informa essa condição. A regra é uma heurística demonstrativa, não uma avaliação oficial de segurança ou uma previsão de criminalidade.

## Dados e análise espacial

O pipeline em `data-science/` cruza o inventário de iluminação pública de 2025 com os limites geográficos dos espaços cadastrados e gera um relatório agregado consumido pela API, restrito a gestores.

Fonte: [Inventário de Iluminação Pública do Recife](https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife), publicado pela EMLURB sob licença [ODbL](https://opendatacommons.org/licenses/odbl/).

O inventário não confirma o funcionamento das luminárias. O projeto também utiliza dados demonstrativos sintéticos para apresentar indicadores de gestão, sem incluí-los nas recomendações públicas.

Para regenerar o relatório, com Python 3.11+:

```powershell
$env:PYTHONPATH = "data-science/src"
python -m pracasegura_ds.spatial_audit --sources postes --output backend/src/main/resources/data/urban-indicators.json
```

Reinicie o backend após a geração.

## Tecnologias

- **Frontend:** React, React Router e CSS.
- **Backend:** Java 21, Spring Boot, Spring Data JPA e Spring Security.
- **Banco de dados:** PostgreSQL.
- **Ciência de dados:** Python e análise espacial.

O frontend consome a API Spring em `/api`, e o backend gerencia o acesso ao banco de dados. Consulte o [guia de arquitetura do frontend](frontend/ARCHITECTURE.md) para mais detalhes.

## Como executar

**Pré-requisitos:** Git, Node.js, npm, Java 21 e PostgreSQL.

**1. Configure o banco**

Crie um banco PostgreSQL local e configure URL, usuário e senha em `backend/src/main/resources/application.properties`. Não publique credenciais.

**2. Inicie o backend**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API: http://localhost:8080

**3. Inicie o frontend** em outro terminal:

```powershell
cd frontend
npm install
npm start
```

Interface: http://localhost:3000

## Testes

Execute os comandos a partir das respectivas pastas:

```powershell
# Frontend
npm test -- --watchAll=false
npm run build

# Backend
.\mvnw.cmd test

# Pipeline de dados
$env:PYTHONPATH = "src"
python -m unittest discover -s tests -v
```

## Limitações

O PraçaSegura não mede frequência de visitantes, percepção de segurança, criminalidade oficial ou funcionamento das luminárias. Os relatos não são confirmações oficiais, e a recomendação não substitui avaliações técnicas.

Antes da publicação, é necessário revisar configurações de segurança, CSRF, credenciais, provisionamento de gestores e proteção de dados.

## Estrutura

```text
backend/       API, persistência e segurança
frontend/      Interface React
data-science/  Auditoria de fontes e análise espacial
README.md      Documentação do projeto
```