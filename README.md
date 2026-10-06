# PraçaSegura

Plataforma web para apoiar o monitoramento e a análise da segurança em praças públicas do Recife por meio de dados, visualizações e um modelo de estimativa de risco.

> **MVP desenvolvido a partir do desafio "Ampliação da segurança em praças públicas via tecnologia", da Prefeitura do Recife.**

## Sobre o projeto

O PraçaSegura busca centralizar informações sobre praças públicas, ocorrências e condições de infraestrutura em uma única plataforma.

A proposta é utilizar **Ciência de Dados e Machine Learning** para transformar dados públicos e dados simulados em indicadores que possam auxiliar a identificação de padrões de ocorrência e apoiar a tomada de decisão.

O sistema possui duas perspectivas principais:

* **Gestor público:** visualização de indicadores, mapa das praças, ocorrências e estimativa de risco.
* **Cidadão:** consulta de informações sobre uma praça e registro de ocorrências ou problemas identificados no local.

Os índices apresentados pelo sistema são **estimativas analíticas para apoio à decisão** e não representam uma classificação definitiva de periculosidade de uma praça.

## MVP

A primeira versão do PraçaSegura possui escopo reduzido, priorizando as funcionalidades essenciais para validar a proposta:

* listagem e visualização geográfica das praças;
* dashboard com indicadores;
* página de detalhes de uma praça;
* visualização de ocorrências;
* registro de ocorrência;
* geração de protocolo;
* cálculo de índice de risco;
* análise exploratória dos dados;
* modelo de Machine Learning para estimativa de risco.

Funcionalidades mais avançadas, como alertas automáticos, autenticação completa, integração com sensores/IoT e utilização de dados operacionais em tempo real permanecem como possibilidades para versões futuras.

## Dados

O projeto utiliza prioritariamente dados públicos do Recife.

### Dados reais

**Parques e Praças — Prefeitura do Recife**

Utilizados para obter informações como:

* nome da praça;
* endereço;
* bairro;
* latitude;
* longitude;
* área;
* localização geográfica.

A base está disponível em formatos como CSV e GeoJSON no Portal de Dados Abertos da Prefeitura do Recife.

**Iluminação Pública — Prefeitura do Recife / EMLURB**

Utilizada como fonte complementar para informações relacionadas à infraestrutura de iluminação pública, incluindo localização dos postes e características das luminárias.

### Dados simulados

Como a base pública de ocorrências da Guarda Municipal disponível no Portal de Dados Abertos atualmente não possui registros acessíveis, as ocorrências utilizadas no MVP serão inicialmente **sintéticas**.

Os dados simulados serão construídos de forma controlada para permitir:

* desenvolvimento do banco de dados;
* construção dos dashboards;
* testes da API;
* análise exploratória;
* treinamento e avaliação inicial do modelo de Machine Learning.

Os dados simulados serão identificados no projeto para evitar que sejam interpretados como ocorrências reais.

## Ciência de Dados

O componente de Ciência de Dados é utilizado para identificar padrões relacionados às ocorrências e estimar um índice de risco para cada praça.

Entre as variáveis consideradas estão:

* horário;
* dia da semana;
* quantidade de ocorrências;
* gravidade das ocorrências;
* iluminação;
* fluxo estimado de pessoas;
* disponibilidade de equipamentos.

O índice de risco varia de **0 a 100** e é utilizado como indicador analítico.

No MVP, o modelo será mantido simples e interpretável, permitindo avaliar sua aplicação antes de evoluir para modelos mais complexos.

## Arquitetura

```text
                    ┌─────────────────────┐
                    │      React          │
                    │    TypeScript       │
                    └──────────┬──────────┘
                               │
                              REST
                               │
                    ┌──────────▼──────────┐
                    │    Spring Boot      │
                    │       API           │
                    └───────┬─────┬───────┘
                            │     │
                    ┌───────▼─┐   │
                    │PostgreSQL│   │
                    └─────────┘   │
                                  │
                           ┌──────▼──────┐
                           │   FastAPI   │
                           │ Python / ML │
                           └─────────────┘
```

## Tecnologias

### Front-end

* React
* TypeScript
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

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* FastAPI

### Desenvolvimento

* Git
* GitHub
* Docker

## Estrutura prevista

```text
praca-segura/
│
├── frontend/
│   └── ...
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

## Privacidade

O projeto não utiliza reconhecimento facial, identificação individual ou rastreamento de pessoas.

A análise é realizada de forma agregada, considerando informações relacionadas ao espaço público.

Imagens eventualmente utilizadas no registro de ocorrências devem ser tratadas de acordo com as regras de privacidade aplicáveis.

## Fonte do desafio

Projeto desenvolvido a partir do desafio público:

**"Ampliação da segurança em praças públicas via tecnologia"**

Prefeitura do Recife — CORETO.

## Status

**Em desenvolvimento — MVP**

O objetivo desta primeira versão é validar a proposta com um produto funcional, utilizando dados públicos e dados sintéticos antes de uma eventual integração com dados operacionais reais.

## Licença

O código-fonte deste projeto está disponível sob a licença **MIT**.

Os conjuntos de dados públicos utilizados pelo projeto permanecem sujeitos às respectivas licenças e condições de uso de suas fontes originais.
