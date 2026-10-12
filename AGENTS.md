# AGENTS.md — Regras de desenvolvimento do PraçaSegura

## 1. Contexto do projeto

O PraçaSegura é um MVP para consulta e monitoramento de informações sobre praças públicas do Recife, incluindo ocorrências, infraestrutura e, futuramente, indicadores relacionados à segurança.

O projeto já está em desenvolvimento. **Não reconstrua o sistema do zero.** Preserve a arquitetura, o código, as funcionalidades e as decisões existentes sempre que possível.

## 2. Regra principal: preservar o código

* Nunca altere, crie, exclua ou mova arquivos sem necessidade justificada.
* Não faça alterações antes de apresentar o diagnóstico e receber autorização explícita do usuário.
* Não reescreva arquivos inteiros quando uma alteração localizada for suficiente.
* Não refatore código funcional apenas por preferência de estilo.
* Não remova funcionalidades existentes para simplificar uma implementação.
* Não substitua tecnologias, bibliotecas, versões ou ferramentas sem autorização.
* Não sobrescreva alterações locais do usuário.
* Não reverta commits nem execute operações destrutivas do Git sem autorização.
* Não altere configurações, dependências ou estrutura de diretórios sem explicar a necessidade.

## 3. Fluxo obrigatório de trabalho

### Fase 1 — Diagnóstico

Antes de implementar qualquer mudança:

1. Inspecione a estrutura do projeto.
2. Leia os arquivos relevantes para a tarefa.
3. Identifique as tecnologias e suas versões.
4. Verifique a integração entre frontend, backend e banco de dados.
5. Identifique o que já existe, o que funciona e o que está pendente.
6. Identifique possíveis inconsistências entre código e documentação.
7. Apresente um diagnóstico curto e um plano de execução por etapas.

**Durante essa fase, trabalhe exclusivamente em modo de leitura. Não modifique arquivos.**

Aguarde autorização explícita do usuário antes de implementar.

### Fase 2 — Planejamento da alteração

Depois da autorização:

1. Explique quais arquivos precisam ser alterados.
2. Informe o motivo de cada alteração.
3. Delimite o escopo da implementação.
4. Identifique possíveis impactos em outras funcionalidades.
5. Aguarde esclarecimentos quando houver ambiguidades relevantes.

Não amplie o escopo sem autorização.

### Fase 3 — Implementação incremental

* Faça alterações pequenas, localizadas e verificáveis.
* Resolva um problema por vez.
* Preserve nomes, contratos de API e padrões já utilizados.
* Evite duplicar serviços, componentes, endpoints ou regras de negócio.
* Não adicione dependências se a solução puder utilizar as existentes.
* Não implemente funcionalidades futuras antes da hora.
* Não altere arquivos não relacionados ao objetivo autorizado.

### Fase 4 — Validação

Após cada etapa:

1. Execute os testes pertinentes já disponíveis.
2. Execute a compilação apropriada do backend e/ou frontend.
3. Verifique contratos, rotas, autenticação, permissões e integração com o banco quando afetados.
4. Analise os erros encontrados antes de tentar corrigi-los.
5. Informe o que foi validado e o que ainda precisa de teste manual.

Nunca declare que uma funcionalidade está funcionando sem evidências suficientes.

Se algum teste não puder ser executado, informe isso explicitamente.

### Fase 5 — Relatório

Ao terminar cada etapa, informe:

* O que foi alterado.
* Quais arquivos foram modificados.
* Por que as mudanças eram necessárias.
* Quais testes foram executados e seus resultados.
* Quais pendências permanecem.

## 4. Tecnologias e arquitetura

O projeto utiliza React e JavaScript no frontend, Spring Boot e Java no backend e PostgreSQL como banco de dados.

Docker é utilizado na infraestrutura de desenvolvimento.

Antes de assumir detalhes adicionais, confirme-os nos arquivos do projeto. Não presuma que serviços, bibliotecas ou funcionalidades planejadas já estão implementados.

## 5. Regras de integração

* Preserve os contratos existentes entre frontend e backend, salvo quando a alteração for necessária e autorizada.
* Confira rotas, métodos HTTP, parâmetros, payloads e formatos de resposta.
* Verifique o tratamento de erros e os estados de carregamento da interface.
* Respeite a autenticação e as permissões de cada perfil.
* Não exponha credenciais, senhas, tokens ou informações pessoais.
* Não altere o banco de dados, apague registros ou execute migrações destrutivas sem autorização explícita.
* Não crie dados fictícios para mascarar falhas de integração.
* Não desative mecanismos de segurança para fazer uma funcionalidade funcionar.

## 6. Requisitos funcionais prioritários

O objetivo imediato é finalizar frontend e backend, sem desenvolver Machine Learning nesta etapa.

A aplicação deve permitir:

* Consultar as praças disponíveis.
* Consultar as ocorrências associadas a uma praça específica.
* Visualizar ocorrências de uma praça independentemente de quem as registrou, respeitando as permissões de acesso.
* Registrar ocorrências vinculadas à praça selecionada.
* Permitir que cidadãos acompanhem seus próprios registros.
* Permitir que gestores consultem e administrem as ocorrências conforme as permissões existentes.
* Atualizar indicadores conforme a praça selecionada, quando aplicável.
* Preservar o histórico de ocorrências.

Antes de alterar regras de acesso, confirme o comportamento atual e proponha uma solução compatível com os requisitos.

## 7. Documentação

* Mantenha o README coerente com a implementação real.
* Diferencie funcionalidades implementadas, em desenvolvimento e planejadas.
* Não documente endpoints, tecnologias ou integrações que não existam.
* Não altere a documentação antes de verificar o código correspondente.

## 8. Git e segurança operacional

* Inspecione `git status` antes de mudanças.
* Preserve arquivos modificados e não commitados.
* Não execute `git reset --hard`, `git clean`, exclusões em massa ou comandos equivalentes sem autorização explícita.
* Não faça commits, pushes ou publicação em produção sem solicitação.
* Nunca revele nem copie segredos encontrados em arquivos de configuração.

## 9. Comunicação

Explique as decisões em português brasileiro, com linguagem clara e objetiva.

Priorize soluções simples, manteníveis e compatíveis com a implementação atual.

Se houver mais de uma solução viável, recomende uma e explique brevemente o motivo.

**A autorização para uma etapa não autoriza automaticamente as etapas seguintes.** Respeite o escopo aprovado e peça nova autorização quando houver mudança relevante de escopo.
