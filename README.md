# PraçaSegura

Plataforma web para apoiar o monitoramento e a análise da segurança em praças públicas do Recife por meio de dados, visualizações e um modelo de estimativa de risco.

> **MVP desenvolvido a partir do desafio "Ampliação da segurança em praças públicas via tecnologia", da Prefeitura do Recife.**

## Sobre o projeto

O PraçaSegura busca centralizar informações sobre praças públicas, ocorrências e condições de infraestrutura em uma única plataforma.

A proposta utiliza **Ciência de Dados e Machine Learning** para transformar dados públicos e dados sintéticos em indicadores capazes de auxiliar na identificação de padrões e apoiar a tomada de decisão.

O sistema possui duas perspectivas principais:

* **Gestor público:** visualização de indicadores, mapa das praças, ocorrências e estimativa de risco.
* **Cidadão:** consulta de informações sobre uma praça e registro de ocorrências ou problemas identificados no local.

Os índices apresentados são estimativas analíticas para apoio à decisão e não representam uma classificação definitiva de periculosidade.

## MVP

A primeira versão do PraçaSegura possui escopo reduzido, priorizando as funcionalidades essenciais para validar a proposta:

* Listagem e visualização geográfica das praças.
* Dashboard com indicadores.
* Página de detalhes de uma praça.
* Visualização e registro de ocorrências.
* Geração de protocolo para ocorrências registradas.
* Cálculo de índice de risco.
* Análise exploratória dos dados.
* Modelo de Machine Learning para estimativa de risco.

Funcionalidades como alertas automáticos, autenticação completa, integração com sensores e utilização de dados operacionais em tempo real permanecem como possibilidades para versões futuras.

## Dados

O projeto utiliza prioritariamente dados públicos do Recife, complementados por dados sintéticos quando necessário.

### Dados reais

**Parques e Praças — Prefeitura do Recife**

Fonte utilizada para obter informações como:

* Nome da praça.
* Endereço e bairro.
* Latitude e longitude.
* Área e localização geográfica.

Os dados podem ser consultados no Portal de Dados Abertos da Prefeitura do Recife, conforme a disponibilidade dos conjuntos publicados.

**Iluminação Pública — Prefeitura do Recife / EMLURB**

Fonte complementar para informações relacionadas à infraestrutura de iluminação pública, incluindo localização dos postes e características das luminárias, conforme os campos disponíveis na base.

### Dados sintéticos

Como a base pública de ocorrências da Guarda Municipal não apresenta registros acessíveis para utilização no MVP, as ocorrências serão inicialmente **simuladas**.

Os dados sintéticos permitirão:

* Desenvolver e testar o banco de dados.
* Construir dashboards e visualizações.
* Testar os endpoints da API.
* Realizar análises exploratórias.
* Treinar e avaliar inicialmente o modelo de Machine Learning.

Os dados simulados serão identificados e documentados para evitar que sejam confundidos com ocorrências reais.

## Ciência de Dados e Machine Learning

O componente de Ciência de Dados busca identificar padrões associados às ocorrências e estimar um índice de risco para cada praça.

Entre as variáveis consideradas estão:

* Horário e dia da semana.
* Quantidade e gravidade das ocorrências.
* Condições de iluminação.
* Fluxo estimado de pessoas.
* Disponibilidade de equipamentos e infraestrutura.

O índice de risco varia de **0 a 100** e funciona como indicador analítico de apoio à decisão.

No MVP, a abordagem prioriza modelos simples e interpretáveis, permitindo avaliar os resultados e as limitações antes de evoluir para soluções mais complexas.

Como parte dos dados é sintética, os resultados iniciais não devem ser interpretados como evidência de risco real. A validação operacional dependerá da disponibilidade de dados reais e representativos.

## Arquitetura

A aplicação será organizada em três componentes principais:

```text
                ┌──────────────────────┐
                │       React          │
                │     JavaScript       │
                └──────────┬───────────┘
                           │
                       REST / HTTP
                           │
                ┌──────────▼───────────┐
                │     Spring Boot      │
                │        API           │
                └──────┬────────┬──────┘
                       │        │
              ┌────────▼───┐    │
              │ PostgreSQL │    │
              └────────────┘    │
                                │
                       ┌────────▼────────┐
                       │   FastAPI       │
                       │   Python / ML   │
                       └─────────────────┘
```

O React será responsável pela interface e interação com o usuário. O Spring Boot concentrará as regras de negócio e o acesso ao banco de dados. O serviço FastAPI disponibilizará as funcionalidades de análise e predição desenvolvidas em Python.

## Tecnologias

### Front-end

* React
* JavaScript
* React Router
* CSS
* Biblioteca de mapas
* Biblioteca de gráficos

### Back-end

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* PostgreSQL

### Ciência de Dados e Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* FastAPI

### Desenvolvimento e infraestrutura

* Git
* GitHub
* Docker

## Estrutura do projeto

```text
praca-segura/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/
│   └── ...
│
├── ml-service/
│   └── ...
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── README.md
│
├── docs/
│   └── ...
│
├── docker-compose.yml
└── README.md
```

A estrutura do front-end utiliza arquivos JavaScript (`.js`) e CSS, sem TypeScript. A organização definitiva dos diretórios poderá ser ajustada conforme a implementação.

## Privacidade

O projeto não utiliza reconhecimento facial, identificação individual ou rastreamento de pessoas.

A análise prioriza informações agregadas relacionadas ao espaço público.

Imagens eventualmente anexadas aos registros de ocorrências deverão ser tratadas de acordo com as regras de privacidade aplicáveis, com atenção à exposição de dados pessoais.

## Fonte do desafio

Projeto desenvolvido a partir do desafio público **"Ampliação da segurança em praças públicas via tecnologia"**, da Prefeitura do Recife — CORETO.

## Status

**Em desenvolvimento — MVP**

O objetivo desta primeira versão é validar a proposta com um produto funcional, utilizando dados públicos e sintéticos antes de uma eventual integração com dados operacionais reais.

## Licença

O código-fonte do projeto está disponível sob a licença **MIT**.

Os conjuntos de dados públicos utilizados permanecem sujeitos às respectivas licenças e condições de uso das fontes originais.
