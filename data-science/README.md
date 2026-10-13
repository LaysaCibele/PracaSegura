# PraçaSegura — Ciência de Dados

Esta etapa começa com uma auditoria reproduzível das fontes públicas do Recife. O fluxo lê os arquivos CSV publicados em streaming, compara a quantidade de linhas com o índice CKAN e gera apenas métricas agregadas. Os registros brutos ficam em memória e não são gravados no projeto.

## Fontes catalogadas

| Recurso | Responsável/publicador | Atualização informada no portal | Licença | Uso exploratório previsto |
| --- | --- | --- | --- | --- |
| [Parques e Praças](https://dados.recife.pe.gov.br/dataset/parques-e-pracas) | Secretaria de Infraestrutura e Serviços Urbanos do Recife | 2026-03-04 | ODbL | Geografia e atributos para validar a associação com as praças do app |
| [Postes — iluminação pública 2025](https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife) | EMLURB | 2026-03-04 | ODbL | Inventário espacial; não interpretar como prova de funcionamento da luminária |
| [Atendimentos EMLURB 156 — 2026](https://dados.recife.pe.gov.br/dataset/central-de-atendimento-de-servicos-da-emlurb-156) | EMLURB | 2026-06-19 | ODbL | Demandas de serviço, após avaliar cobertura e compatibilidade temporal/espacial |

Os dados são publicados no [Portal de Dados Abertos do Recife](https://dados.recife.pe.gov.br/). A licença ODbL requer atenção às condições de atribuição e compartilhamento ao redistribuir bases derivadas. Confira os metadados do portal novamente antes de cada análise, pois os arquivos e as datas de atualização podem mudar.

## Executar a auditoria

Requer Python 3.11 ou mais recente e acesso à internet. Não há dependências externas.

No PowerShell, a partir desta pasta:

```powershell
$env:PYTHONPATH = "src"
python -m pracasegura_ds.audit
```

Para consultar apenas um recurso ou salvar o relatório agregado:

```powershell
python -m pracasegura_ds.audit --sources demandas_156
python -m pracasegura_ds.audit --output reports/auditoria.json
```

Para gerar o indicador espacial que a página de detalhes das praças consome, execute da raiz do repositório:

```powershell
$env:PYTHONPATH = "data-science/src"
python -m pracasegura_ds.spatial_audit --sources postes --output backend/src/main/resources/data/urban-indicators.json
```

O arquivo contém metadados de fonte e somente contagens agregadas. O frontend usa `sourceKey` estável para selecionar o recorte dos 15 espaços (12 praças e 3 parques).

O relatório inclui quantidade de linhas no arquivo e no índice CKAN, campos ausentes, coordenadas válidas/ausentes/fora de um envelope aproximado de Recife, intervalo de datas, frequências de grupos e assinaturas repetidas para revisão. Uma assinatura repetida não prova que houve duplicação: as fontes não expõem uma chave confiável de solicitação, e registros legítimos podem compartilhar atributos. Nenhuma linha é removida. O envelope geográfico serve somente para triagem; não é o limite municipal oficial. As contagens de grupos são limitadas aos 15 valores mais frequentes.

### Achados da auditoria de 2026-10-13

- O CSV de praças tem 505 linhas e coincide com o índice CKAN; todos os pontos estão no envelope aproximado usado na triagem. O catálogo contém praças, parques e áreas verdes, que precisam ser distinguidos.
- O CSV de iluminação tem 111.666 linhas e coincide com o índice CKAN; contém 90.529 IDs `id_ponto` distintos e 7.099 linhas sem ID. O campo `atualizaca` está vazio nas linhas consultadas. Os tipos não comprovam funcionamento.
- O CSV do 156 tem 61.225 linhas, enquanto o índice CKAN informa 11.374. As linhas do arquivo têm 13 colunas consistentes, então a diferença não é causada por registros CSV malformados. O recurso inclui datas de 2009 a 2026, apesar do título “2026”; 30.244 linhas não têm coordenadas. A divergência entre arquivo e índice precisa ser esclarecida antes de usar o índice para análises.
- Os 15 espaços do catálogo foram associados às feições do GeoJSON pelo nome oficial normalizado, bairro e tipo. Componentes múltiplos são agrupados; a contagem considera ponto dentro do polígono e ID distinto por espaço.

## Testes

```powershell
$env:PYTHONPATH = "src"
python -m unittest discover -s tests -v
```

## Limites atuais

- O catálogo contém 12 praças e 3 parques e preserva os quatro registros que já existiam no app.
- O backend precisa estar disponível para comparar as praças do app; a auditoria não consulta o banco e não requer credenciais.
- Pedidos do 156 medem solicitações de serviço, não condição física observada nem criminalidade.
- O inventário de postes, sozinho, não demonstra que uma lâmpada funciona.
- O recorte espacial conta IDs distintos por espaço. Linhas sem `id_ponto` são reportadas em separado e tornam o total indisponível quando caem no polígono; os dados são regeneráveis pelo comando acima.
- Os IDs não confirmam equipamentos físicos únicos nem luminárias funcionando. Os dados do 156 continuam fora da interface por limitações de cobertura e pela divergência entre CSV e índice.
- Ocorrências do app são relatos de usuários e não são usadas nesta coleta; descrições podem conter informações pessoais.
- Não existe variável-alvo validada para aprendizado supervisionado. Nenhuma nota ou classificação de risco é produzida.
- Não foi calculada nota de segurança, estimativa de criminalidade ou modelo preditivo. As ocorrências do app são relatos e não servem como rótulos validados.
