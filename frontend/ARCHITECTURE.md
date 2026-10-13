# Frontend do PraçaSegura: guia de apresentação

Este guia descreve os arquivos React, o papel de cada camada e o percurso dos dados. O frontend não acessa PostgreSQL diretamente: chama a API Spring Boot em `/api`, e o backend consulta o banco. O relatório agregado de iluminação fica em recurso privado do backend e só é servido a gestores.

## Fluxo de dados

```text
index.js -> App.js -> página/componente -> service/*.js -> fetch('/api/...')
                                                     -> Spring Controller
                                                     -> Service -> Repository/JPA -> PostgreSQL

SquareDetails -> UrbanIndicators -> GET /api/urban-indicators (gestor)
```

O `package.json` define o proxy de desenvolvimento `http://localhost:8080`. Por isso, chamadas relativas como `/api/squares` chegam ao Spring sem URL duplicada no código. `credentials: 'same-origin'` acompanha o cookie de sessão. Os componentes guardam estado de carregamento, erro e dados; os serviços encapsulam HTTP e JSON.

## Componentes e páginas

| Arquivo | Responsabilidade |
| --- | --- |
| `src/App.js` | Raiz de navegação. Consulta sessão e espaços uma vez, organiza rotas, estados de filtros e seleção, protege `/gestao` para gestores e coordena atualização após gravações. |
| `src/App.css` | Estilos do layout e das páginas que pertencem à aplicação. |
| `src/index.js` | Ponto de entrada React; cria a raiz DOM, importa estilos globais e renderiza `App` em `StrictMode`. |
| `src/index.css` | Regras globais: tipografia, cores base, reset e elementos comuns. |
| `src/reportWebVitals.js` | Utilitário opcional do Create React App para métricas de desempenho; hoje é invocado sem enviar dados a analytics. |
| `src/logo.svg` | Marca vetorial original do Create React App, mantida como recurso estático. |
| `src/components/Header/Header.js` | Navegação principal, links de acordo com papel, estado da sessão e ação de sair. |
| `src/components/Header/Header.css` | Aparência e responsividade do cabeçalho. |
| `src/components/Footer/Footer.js` | Rodapé compartilhado. |
| `src/components/Footer/Footer.css` | Estilos do rodapé. |
| `src/components/Hero/Hero.js` | Apresentação visual da página inicial e chamada para conhecer os espaços. |
| `src/components/Hero/Hero.css` | Estilos do banner inicial. |
| `src/components/SectionIntro/SectionIntro.js` | Texto introdutório que contextualiza a listagem de locais. |
| `src/components/SectionIntro/SectionIntro.css` | Estilos da introdução. |
| `src/components/SquaresSection/SquaresSection.js` | Recebe e busca a lista de espaços, separa visualmente praças e parques e cria links para detalhes. |
| `src/components/SquaresSection/SquaresSection.css` | Cards, grupos e ajustes responsivos da listagem. |
| `src/components/SquareSelector/SquareSelector.js` | Campo seletor usado para filtrar gráficos e ocorrências por local. |
| `src/components/SquareSelector/SquareSelector.css` | Estilos do seletor. |
| `src/components/SquareManagement/SquareManagement.js` | Formulários de criação, edição e remoção de espaços, incluindo tipo e área. |
| `src/components/SquareManagement/SquareManagement.css` | Estilos do formulário de gestão. |
| `src/components/OccurrenceFilters/OccurrenceFilters.js` | Controles de período inicial/final, categoria e status; devolve filtros ao estado da página. |
| `src/components/OccurrenceFilters/OccurrenceFilters.css` | Layout e responsividade dos filtros. |
| `src/components/OccurrenceForm/OccurrenceForm.js` | Valida e envia um novo relato real para o serviço; o backend define autor e data. |
| `src/components/OccurrenceForm/OccurrenceForm.css` | Estilos do formulário de relato. |
| `src/components/OccurrenceList/OccurrenceList.js` | Carrega relatos próprios para cidadão ou todas as ocorrências para gestão; oferece mudança de status apenas à gestão. |
| `src/components/OccurrenceList/OccurrenceList.css` | Cards, estados e distintivo sintético usado na visão de gestão. |
| `src/components/SquareRecommendation/SquareRecommendation.js` | Busca a recomendação pública agregada da praça; mostra apenas nota e classificação, nunca relatos ou autores. |
| `src/components/SquareRecommendation/SquareRecommendation.css` | Estilos da recomendação resumida exibida ao cidadão. |
| `src/components/Dashboard/Dashboard.js` | Busca indicadores calculados pelo backend e os mostra como KPIs, barras e recomendações explicáveis. Informa que taxa operacional não é índice de segurança. |
| `src/components/Dashboard/Dashboard.css` | Cartões, barras, indicadores e recomendações do painel. |
| `src/components/UrbanIndicators/UrbanIndicators.js` | Busca o JSON agregado protegido pela API de gestão, encontra espaço por `sourceKey` e apresenta fonte, data, contagem e ressalvas. |
| `src/components/UrbanIndicators/UrbanIndicators.css` | Estilos do cartão de infraestrutura e da atribuição de fonte. |
| `src/pages/Login/Login.js` | Alterna entre login e cadastro; chama serviços, mostra erro/carregamento e atualiza a sessão ao autenticar. |
| `src/pages/Login/Login.css` | Estilos da tela de acesso. |
| `src/pages/SquareDetails/SquareDetails.js` | Lê `:id` da URL e combina metadados com conteúdo por perfil: cidadão vê recomendação e relatos próprios; gestor vê painel, todos os relatos e iluminação. |
| `src/pages/SquareDetails/SquareDetails.css` | Hero de detalhes, localização, tipo e avisos. |

## Serviços: HTTP separado da apresentação

| Arquivo | Chamadas |
| --- | --- |
| `src/services/authService.js` | `login`, `register`, `getCurrentUser` e `logout` em `/api/auth`; envia credenciais e converte falhas em mensagens. |
| `src/services/squareService.js` | `getSquares`, `getSquareById`, `getSquareRecommendation`, `createSquare`, `updateSquare`, `deleteSquare` em `/api/squares`; centraliza cabeçalho JSON, credenciais, erros e resposta `204`. |
| `src/services/occurrenceService.js` | Lista e estatísticas com filtros, criação via `POST`, atualização de status via `PATCH`. Usa `URLSearchParams` para montar filtros sem concatenar valores manualmente. |

## O caso dos postes: de fonte a tela

1. `data-science/src/pracasegura_ds/spatial_audit.py` baixa o CSV municipal de iluminação e o GeoJSON de praças/parques.
2. `spatial.py` associa componentes de polígono por nome oficial, bairro e tipo; testa cada coordenada dentro dos polígonos e conta IDs `id_ponto` distintos por espaço.
3. O script grava somente o agregado em `backend/src/main/resources/data/urban-indicators.json`; linhas brutas não são persistidas.
4. `SquareDetails` passa `square.sourceKey` a `UrbanIndicators`.
5. O componente pede `GET /api/urban-indicators`; o backend autoriza somente gestores e serve o agregado empacotado, que o componente localiza por `sourceKey`.

O agregado é servido pela API Spring com autorização de gestor; os dados brutos não são armazenados no PostgreSQL. Os metadados do espaço, por sua vez, vêm de `GET /api/squares` e `GET /api/squares/{id}`; o backend os mantém no PostgreSQL.

## Ocorrências: sessão, API e banco

1. Ao iniciar, `App.js` chama `getCurrentUser()` e `getSquares()`; enquanto isso, a página lê os estados de carregamento.
2. O serviço envia `fetch` para `/api`. O proxy do React encaminha a chamada ao Spring durante desenvolvimento.
3. O controller identifica usuário autenticado e chama o serviço Java. Este aplica filtros e permissões e usa repositórios JPA para ler/escrever PostgreSQL.
4. O endpoint devolve DTOs JSON. React atualiza o estado; `refreshKey` faz dashboard e listagem recarregarem após novo relato ou atualização de status.

Para cidadão, a API retorna somente relatos reais próprios; tentar abrir o ID de outro autor também é bloqueado. Indicadores de ocorrências são exclusivos da gestão. A recomendação pública retorna somente uma nota agregada baseada em ocorrências reais resolvidas e registros reais de Segurança, sem dados individuais. O inventário de iluminação só aparece na interface de gestão.

## Testes do frontend

Os arquivos `*.test.js` junto aos módulos cobrem navegação, login, detalhes, filtro de espaço, indicadores de iluminação, rótulos sintéticos, dashboard e permissões de edição. Execução: `npm test -- --watchAll=false` dentro de `frontend`.

## Arquivos públicos e de configuração

| Arquivo | Finalidade |
| --- | --- |
| `public/index.html` | HTML que contém o elemento raiz do React e metadados do navegador. |
| `public/manifest.json` | Metadados do app instalável. |
| `public/robots.txt` | Orientação básica para crawlers. |
| `public/favicon.ico`, `public/logo192.png`, `public/logo512.png` | Ícones do app. |
| `public/images/praca-republica.png` | Imagem local usada pela interface quando cadastrada no espaço. |
| `../backend/src/main/resources/data/urban-indicators.json` | Relatório agregado de iluminação servido somente ao perfil gestor pela API. |
| `package.json` | Scripts, dependências, proxy da API e configuração de navegadores do React Scripts. |
| `package-lock.json` | Versões travadas para instalação reproduzível do npm. |
| `README.md` | Instruções gerais do Create React App; o guia específico do projeto é este documento e o README raiz. |

## Arquivos de teste e suporte

| Arquivo | O que verifica |
| --- | --- |
| `src/App.test.js` | Navegação exibida conforme papel do usuário no cabeçalho. |
| `src/setupTests.js` | Inicialização das extensões de teste do Testing Library/Jest. |
| `src/components/SquareSelector/SquareSelector.test.js` | Opções e seleção de espaço. |
| `src/components/OccurrenceList/OccurrenceList.test.js` | Visibilidade, filtros, identificação sintética e edição de status. |
| `src/components/Dashboard/Dashboard.test.js` | Busca e rótulos dos indicadores. |
| `src/components/UrbanIndicators/UrbanIndicators.test.js` | Carregamento do relatório agregado e estados sem dados. |
| `src/pages/Login/Login.test.js` | Interação do fluxo de autenticação. |
| `src/pages/SquareDetails/SquareDetails.test.js` | Carregamento dos detalhes e seus estados. |

