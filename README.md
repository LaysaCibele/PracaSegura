# PraçaSegura

Plataforma web para consulta de informações sobre praças públicas do Recife, visualização de ocorrências, acompanhamento das condições de infraestrutura e análise de fatores relacionados à segurança desses espaços.

> **MVP desenvolvido a partir do desafio "Ampliação da segurança em praças públicas via tecnologia", da Prefeitura do Recife — CORETO.**

## Sobre o projeto

O PraçaSegura tem como objetivo ampliar o acesso da população a informações sobre praças públicas, contribuindo para uma melhor compreensão das condições de segurança e infraestrutura desses espaços.

A proposta combina desenvolvimento web, Ciência de Dados e Machine Learning para organizar informações sobre praças, ocorrências e iluminação pública, permitindo identificar padrões e apoiar a tomada de decisão.

O projeto possui duas perspectivas complementares:

* **Cidadão:** consulta informações sobre as praças, acompanha ocorrências registradas, consulta condições de infraestrutura e registra problemas identificados nos locais.
* **Gestor público:** administra as informações das praças, acompanha ocorrências e utiliza indicadores para apoiar o planejamento de ações públicas.

A proposta inclui a construção de um índice de segurança estimado para cada praça, considerando fatores como ocorrências registradas, iluminação e infraestrutura. Esse indicador deverá apresentar suas fontes, critérios e limitações, sem ser tratado como uma medida definitiva de criminalidade ou garantia de segurança.

## Funcionalidades

### Implementadas no MVP

* Cadastro e autenticação de usuários.
* Perfis de cidadão e gestor.
* Listagem e consulta de praças.
* Cadastro e edição de informações das praças pelo gestor.
* Registro de ocorrências associado a uma praça.
* Geração e acompanhamento de registros de ocorrências.
* Consulta de ocorrências com controle de acesso.
* Atualização do status das ocorrências pelo gestor.
* Dashboard com total de ocorrências e distribuição por status e categoria.
* Persistência de dados em PostgreSQL.

### Em desenvolvimento e previstas

* Consulta pública das ocorrências de todas as praças por cidadãos autenticados.
* Página de detalhes de cada praça com informações consolidadas.
* Visualização geográfica das praças em um mapa.
* Integração de dados públicos de iluminação e infraestrutura.
* Construção e validação de um índice de segurança estimado.
* Análises exploratórias para identificar padrões nas ocorrências.
* Desenvolvimento e avaliação de modelos de Machine Learning.
* Dashboard com indicadores de segurança e infraestrutura por praça.
* Integração de um serviço Python para disponibilizar análises e estimativas, caso necessário.

O escopo poderá evoluir conforme a disponibilidade dos dados e os resultados das etapas de desenvolvimento e validação.

## Dados

O projeto pretende utilizar dados públicos do Recife, complementados por dados sintéticos quando necessário para desenvolver e testar o MVP.

### Dados públicos

**Praças e parques — Prefeitura do Recife**

Os conjuntos de dados disponíveis poderão fornecer informações como:

* Nome e identificação da praça.
* Endereço e bairro.
* Coordenadas geográficas.
* Características e informações de infraestrutura, conforme os campos publicados.

**Iluminação pública — Prefeitura do Recife / EMLURB**

Os dados de iluminação poderão contribuir para a análise das condições de infraestrutura das praças, conforme a disponibilidade de informações sobre postes, luminárias e localização.

A utilização de cada fonte dependerá da verificação dos dados, da cobertura geográfica, da atualização e das condições de uso.

### Dados de ocorrências

Quando não houver uma base pública adequada e acessível, dados sintéticos poderão ser utilizados para testar o banco de dados, a API, as visualizações e os fluxos da aplicação.

Esses registros deverão ser identificados como simulados, separados dos dados reais e excluídos de conclusões que pretendam descrever a segurança real das praças.

## Ciência de Dados e Machine Learning

A frente de Ciência de Dados busca investigar fatores associados às condições de segurança dos espaços públicos e desenvolver indicadores que auxiliem a compreensão dos dados disponíveis.

Entre os fatores que poderão ser analisados estão:

* Quantidade, categoria, gravidade e distribuição temporal das ocorrências.
* Condições de iluminação pública.
* Características de infraestrutura e conservação.
* Distribuição geográfica dos registros.
* Disponibilidade, qualidade e cobertura dos dados.

### Índice de segurança estimado

O PraçaSegura prevê um indicador de 0 a 100 para sintetizar fatores relacionados à segurança de cada praça.

A metodologia de cálculo ainda deverá ser definida e validada. O indicador poderá começar com uma abordagem baseada em critérios interpretáveis e evoluir para modelos estatísticos ou de Machine Learning, caso os dados disponíveis permitam.

O resultado deverá ser apresentado com contexto, período de referência e limitações. Um índice não representa uma garantia de segurança, e a ausência de registros não significa necessariamente ausência de problemas.

Modelos treinados com dados sintéticos serão utilizados apenas para desenvolvimento e experimentação. Sua aplicação a situações reais dependerá de dados representativos e de validação adequada.

## Arquitetura

A aplicação utiliza uma arquitetura cliente-servidor.

```text
┌────────────────────────────┐
│          React             │
│      JavaScript / CSS      │
└──────────────┬─────────────┘
               │
          REST / HTTP
               │
┌──────────────▼─────────────┐
│        Spring Boot         │
│     API e regras de        │
│         negócio            │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│        PostgreSQL          │
│      Persistência          │
└────────────────────────────┘
```

O front-end é responsável pela interface e pela interação com o usuário. O back-end concentra as regras de negócio, a autenticação, as permissões e o acesso aos dados. O PostgreSQL armazena as informações da aplicação.

Um serviço independente de Ciência de Dados em Python poderá ser integrado futuramente para disponibilizar análises e predições.

## Tecnologias

### Front-end

* React
* JavaScript
* React Router
* CSS

### Back-end

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Security

### Banco de dados

* PostgreSQL
* Docker

### Ciência de Dados e Machine Learning

Tecnologias previstas para as etapas analíticas:

* Python
* Pandas
* NumPy
* Scikit-learn
* FastAPI, caso seja adotado um serviço independente de predição.

### Desenvolvimento

* Git
* GitHub
* Maven
* npm

## Estrutura do projeto

```text
praca-segura/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── src/
│   └── pom.xml
├── docker-compose.yml
└── README.md
```

A estrutura apresentada representa a organização principal da aplicação. Diretórios adicionais poderão ser incluídos conforme o desenvolvimento das etapas de Ciência de Dados e Machine Learning.

## Privacidade e responsabilidade

O PraçaSegura busca trabalhar com informações relacionadas aos espaços públicos, sem recorrer a reconhecimento facial ou rastreamento individual de pessoas.

Os registros de ocorrências deverão ser tratados com cuidado para evitar a exposição indevida de dados pessoais. A consulta e a administração das informações devem respeitar as permissões de cada perfil.

Os indicadores de segurança serão apresentados como estimativas analíticas, com transparência sobre as fontes utilizadas e as limitações dos dados. O sistema não substitui estatísticas oficiais, avaliações das autoridades competentes ou medidas de segurança pública.

## Origem do projeto

Projeto desenvolvido a partir do desafio público **"Ampliação da segurança em praças públicas via tecnologia"**, da Prefeitura do Recife — CORETO.

## Status

**Em desenvolvimento — MVP**

O projeto está na etapa de construção da aplicação web, com autenticação, gerenciamento de praças, registro de ocorrências e indicadores básicos. As próximas etapas priorizam ampliar a consulta de informações pelo cidadão, integrar dados de infraestrutura e desenvolver uma metodologia validada para estimar fatores relacionados à segurança das praças.

## Licença

O código-fonte do projeto está disponibilizado sob a licença MIT.

Os conjuntos de dados utilizados permanecem sujeitos às respectivas licenças e condições de uso das fontes originais.
