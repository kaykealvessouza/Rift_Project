Rift TCG — Deck & Collection Manager

Aplicação full-stack para gerenciamento de coleções e construção de decks para o TCG Riftbound (Rift).

O projeto foi desenvolvido como um projeto pessoal de estudo e prática de desenvolvimento full-stack, envolvendo construção de API REST, desenvolvimento de interface web, modelagem de regras de negócio, validação de decks, importação/exportação de dados e integração entre frontend e backend.

Durante o desenvolvimento, foram utilizadas ferramentas de Inteligência Artificial como apoio ao processo de programação, principalmente o Google AI Studio e Claude. A IA foi utilizada como ferramenta de auxílio para consulta, explicação de conceitos, implementação e revisão de códigos, investigação de erros e apoio na implementação de determinadas funcionalidades. As decisões de arquitetura, integração, testes, ajustes e validação do funcionamento do projeto foram realizadas durante o processo de desenvolvimento.

O uso de IA neste projeto é parte do processo de desenvolvimento e não significa que o projeto tenha sido simplesmente gerado automaticamente. A IA foi utilizada como ferramenta de apoio ao desenvolvimento e aprendizado.

🏗️ Arquitetura

A aplicação possui separação entre frontend e backend, com comunicação exclusivamente através de uma API HTTP REST.

Backend

Localizado em /backend, o backend é responsável por:

API REST utilizando Node.js + Express + TypeScript
Regras de negócio
Modelos e tipos de dados
Validação das regras de construção de decks
Gerenciamento da coleção
Cálculo de completude da coleção e dos decks
Importação e exportação de decks e coleções
Paginação e filtros do catálogo
Frontend

Localizado em /src, o frontend é uma SPA desenvolvida com:

React 19
TypeScript
Tailwind CSS
Vite

O frontend não acessa diretamente os dados ou regras internas do backend. A comunicação é realizada através de uma camada de cliente HTTP localizada em /src/api/.

🚀 Como Executar
Pré-requisitos
Node.js 18 ou superior
npm ou yarn
1. Instalar dependências
npm install
2. Executar em desenvolvimento

O projeto utiliza um servidor unificado que inicializa a API Express na porta 3000 e integra o middleware de desenvolvimento do Vite.

npm run dev

Depois, acesse:

http://localhost:3000
🛠️ Scripts Disponíveis
Comando	Descrição
npm run dev	Inicia o ambiente de desenvolvimento com Express + Vite HMR utilizando tsx
npm run build	Compila o frontend com Vite e o servidor com esbuild
npm run start	Executa o bundle de produção localizado em dist/server.cjs
📦 Estrutura do Projeto
├── backend/
│   ├── routes/
│   │   ├── cards.ts
│   │   ├── collection.ts
│   │   ├── decks.ts
│   │   └── importExport.ts
│   │
│   ├── services/
│   │   ├── cardService.ts
│   │   ├── collectionService.ts
│   │   ├── deckService.ts
│   │   ├── deckValidator.ts
│   │   ├── importParser.ts
│   │   └── exportService.ts
│   │
│   ├── catalog.ts
│   ├── store.ts
│   └── types.ts
│
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── cardsApi.ts
│   │   ├── collectionApi.ts
│   │   ├── decksApi.ts
│   │   └── importExportApi.ts
│   │
│   ├── components/
│   │   ├── catalog/
│   │   ├── collection/
│   │   ├── decks/
│   │   ├── importExport/
│   │   └── common/
│   │
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
└── server.ts
🃏 Funcionalidades

O projeto atualmente permite:

Navegar pelo catálogo de cartas
Filtrar e paginar cartas
Gerenciar uma coleção
Visualizar o progresso da coleção
Criar e editar decks
Organizar cartas por zonas
Validar decks de acordo com as regras implementadas
Identificar cartas faltantes para completar um deck
Calcular a completude de decks e coleção
Importar listas de cartas
Exportar decks e coleções
Exibir feedback de operações e validações através da interface
⚔️ Validação de Decks

A validação é realizada no backend através do deckValidator.ts.

As regras implementadas incluem:

LEGEND — exatamente 1 carta do tipo LEGEND.
CHAMPION — exatamente 1 carta do tipo CHAMPION.
MAIN — exatamente 39 cartas dos tipos UNIT ou SPELL.
RUNE — exatamente 12 cartas do tipo RUNE.
BATTLEFIELD — exatamente 3 cartas do tipo BATTLEFIELD.
SIDEBOARD — até 8 cartas adicionais dos tipos UNIT ou SPELL.
SIDEBOARD_BATTLEFIELD — até 2 cartas adicionais do tipo BATTLEFIELD.
Limite de cópias — no máximo 3 cópias da mesma carta entre Main e Sideboard, considerando as exceções aplicáveis a Runas, Lendas e Campeões.
Cartas banidas — cartas marcadas como banidas impedem a validação do deck.
Compatibilidade de facção — verificação de compatibilidade das cartas com as facções definidas pela Lenda e pelo Campeão.

As regras de construção e as restrições implementadas foram utilizadas como referência para o conjunto de regras do jogo durante o desenvolvimento.

🧠 Desenvolvimento e uso de IA

A Inteligência Artificial fez parte do processo de desenvolvimento deste projeto como uma ferramenta de apoio de desenvolvimento, principalmente através do Google AI Studio.

Entre os usos estão:

Estruturar linhas de códigos repetitivos 
Explicação de erros e comportamentos do código
Revisão e refatoração de trechos
Auxílio na estruturação de componentes e serviços
Investigação de possíveis soluções para problemas encontrados durante o desenvolvimento
Apoio no desenvolvimento e documentação de funcionalidades

A implementação não foi tratada como um processo de geração automática do projeto. O código foi integrado, testado, adaptado e validado durante o desenvolvimento, com decisões de estrutura e funcionamento sendo tomadas de acordo com os requisitos do projeto.

O objetivo também foi utilizar essas ferramentas como parte do processo de aprendizado e desenvolvimento, e não apenas como uma forma de gerar código pronto.

🎯 Objetivo do Projeto

O Rift TCG foi desenvolvido principalmente como projeto de estudo e experimentação, buscando colocar em prática conceitos de:

Desenvolvimento full-stack
APIs REST
React e TypeScript
Arquitetura de aplicações web
Separação de responsabilidades
Regras de negócio
Validação de dados
Integração entre frontend e backend
Desenvolvimento assistido por IA
Organização e documentação de projetos

O projeto continua sujeito a melhorias e novas funcionalidades.

📌 Tecnologias

Frontend

React 19
TypeScript
Tailwind CSS
Vite

Backend

Node.js
Express
TypeScript
tsx
esbuild

Ferramentas

Git / GitHub
Google AI Studio
npm
