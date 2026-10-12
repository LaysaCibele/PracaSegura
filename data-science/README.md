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
python -m pracasegura_ds.spatial_audit --sources postes --output frontend/public/data/urban-indicators.json
```

O arquivo contém metadados de fonte e somente contagens agregadas. O frontend usa os nomes das quatro praças para selecionar o respectivo recorte e mantém um aviso sobre os limites do inventário.

O relatório inclui quantidade de linhas no arquivo e no índice CKAN, campos ausentes, coordenadas válidas/ausentes/fora de um envelope aproximado de Recife, intervalo de datas, frequências de grupos e assinaturas repetidas para revisão. Uma assinatura repetida não prova que houve duplicação: as fontes não expõem uma chave confiável de solicitação, e registros legítimos podem compartilhar atributos. Nenhuma linha é removida. O envelope geográfico serve somente para triagem; não é o limite municipal oficial. As contagens de grupos são limitadas aos 15 valores mais frequentes.

### Achados da auditoria de 2026-10-12

- O CSV de praças tem 505 linhas e coincide com o índice CKAN; todos os pontos estão no envelope aproximado usado na triagem. O catálogo contém praças, parques e áreas verdes, que precisam ser distinguidos.
- O CSV de iluminação tem 111.666 linhas e coincide com o índice CKAN; todas as coordenadas estão no envelope aproximado. O campo `atualizaca` está vazio nas linhas consultadas. Os tipos de luminária não comprovam estado de funcionamento.
- O CSV do 156 tem 61.225 linhas, enquanto o índice CKAN informa 11.374. As linhas do arquivo têm 13 colunas consistentes, então a diferença não é causada por registros CSV malformados. O recurso inclui datas de 2009 a 2026, apesar do título “2026”; 30.244 linhas não têm coordenadas. A divergência entre arquivo e índice precisa ser esclarecida antes de usar o índice para análises.
- Para os quatro locais informados — Casa Forte, Boa Viagem, Derby e Jaqueira — o GeoJSON municipal contém, respectivamente, 3, 1, 2 e 1 polígonos candidatos. Isso indica componentes geográficos múltiplos para Casa Forte e Derby. A correspondência com os registros internos do PraçaSegura ainda não foi verificada.

## Testes

```powershell
$env:PYTHONPATH = "src"
python -m unittest discover -s tests -v
```

## Limites atuais

- A correspondência nominal entre os quatro locais informados e polígonos públicos foi localizada, mas falta compará-la aos IDs e coordenadas cadastrados no PraçaSegura.
- O backend precisa estar disponível para comparar as praças do app; a auditoria não consulta o banco e não requer credenciais.
- Pedidos do 156 medem solicitações de serviço, não condição física observada nem criminalidade.
- O inventário de postes, sozinho, não demonstra que uma lâmpada funciona.
- O recorte espacial do inventário de iluminação já é apresentado na página de detalhes. Ele conta registros do CSV dentro dos polígonos municipais: Casa Forte (42), Boa Viagem (58), Derby (227) e Jaqueira (295), relatório gerado em 2026-10-12. Os números podem mudar quando a fonte for atualizada e devem ser regenerados pelo comando acima.
- As contagens representam linhas do inventário, não postes únicos nem luminárias em funcionamento. Os dados do 156 continuam fora da interface devido às limitações de cobertura e à divergência entre CSV e índice descritas na auditoria.
- Ocorrências do app são relatos de usuários e não são usadas nesta coleta; descrições podem conter informações pessoais.
- Não existe variável-alvo validada para aprendizado supervisionado. Nenhuma nota ou classificação de risco é produzida.
- Não foi calculada nota de segurança, estimativa de criminalidade ou modelo preditivo. As ocorrências do app são relatos e não servem como rótulos validados.
