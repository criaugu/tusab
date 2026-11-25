---
id: biblioteca-de-prompts
title: Biblioteca de Prompts
sidebar_label: Biblioteca de Prompts
slug: /biblioteca-de-prompts
---

# Biblioteca de Prompts

O Tusab não gera flashcards, quizzes ou resumos: quem gera é a IA do usuário. O Tusab entrega o **pedido pronto**, já amarrado à base (buscar no projeto, citar a fonte, não inventar), e **guarda** o que precisa de memória entre conversas (flashcards e revisão espaçada).

Uma única lista (`tusab-mcp/src/nucleo/prompts.js`) alimenta dois lugares:

- o **menu "+" do Claude Desktop** (prompts MCP), onde o usuário escolhe o prompt, informa projeto e, quando houver, tema e quantidade;
- a aba **Biblioteca de Prompts** da [tela do Tusab](/tela) (`GET /api/prompts`), para copiar e colar em qualquer IA.

## Os 21 prompts prontos

| Categoria | Prompts | Campos |
|---|---|---|
| **Estudar** | Flashcards · Revisar hoje · Quiz de múltipla escolha · Resumo de estudo · Mapa mental (Mermaid) · Explicar de forma simples · Plano de estudo | projeto; tema e quantidade conforme o prompt |
| **Ensinar** | Prova com gabarito · Plano de aula · Lista de exercícios por nível | projeto, tema; quantidade na prova e nos exercícios |
| **Pesquisar** | Revisão do material · Comparar fontes e contradições · Lacunas da base · Ficha de leitura por fonte · Linha do tempo · Citações-chave | projeto, tema; quantidade nas citações |
| **Decidir** | Resposta verificável · Nota técnica | projeto, tema |
| **Criar conteúdo** | Roteiro de vídeo · Post para LinkedIn | projeto, tema |
| **Acompanhar** | Digest da semana | projeto |

Quantidades padrão: 8 no quiz, 7 dias no plano de estudo, 10 na prova e nas citações, 9 nos exercícios. O valor informado fica entre 1 e 50. O tema é cortado em 200 caracteres e o nome do projeto em 120.

Além deles, o atalho `abrir_tusab` ("Abrir o Tusab") abre a tela. Somados às 20 técnicas e aos 22 da terceira e da quarta leva (seções seguintes), a Biblioteca tem **63 prompts** e **5 trilhas**. O "+" do Claude não mostra todos: por padrão, os favoritos e os mais usados (ver [Favoritos, mais usados e o menu "+"](#favoritos)).

## Técnicas com evidência (20 prompts)

Desde a 2.0.0, a Biblioteca tem 20 prompts baseados em técnicas de aprendizagem, ensino, pesquisa e decisão com evidência ou prática consagrada. Cada um mostra a referência no cartão ("Base: autor, ano") e, na prévia, a obra e como ela se aplica. Código: `tusab-mcp/src/nucleo/prompts-catalogo.js`.

| Prompt | Para quê | Modelo | Base |
|---|---|---|---|
| **Pré-teste (antes de estudar)** (`pre-teste`) | Estudar | Rápido | Richland, L. E.; Kornell, N.; Kao, L. S. (2009). *The pretesting effect: Do unsuccessful retrieval attempts enhance learning? Journal of Experimental Psychology: Applied, 15(3), 243–257.* |
| **Lembrar sem olhar** (`recordar-livre`) | Estudar | Intermediário | Roediger, H. L., III; Karpicke, J. D. (2006). *Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.* |
| **Explicar com minhas palavras** (`autoexplicacao`) | Estudar, Ensinar | Intermediário | Chi, M. T. H.; de Leeuw, N.; Chiu, M.-H.; LaVancher, C. (1994). *Eliciting self-explanations improves understanding. Cognitive Science, 18(3), 439–477.* |
| **Treino misturado** (`pratica-intercalada`) | Estudar, Ensinar | Intermediário | Rohrer, D.; Taylor, K. (2007). *The shuffling of mathematics problems improves learning. Instructional Science, 35(6), 481–498.* |
| **Exemplo resolvido passo a passo** (`exemplo-resolvido`) | Estudar, Ensinar | Intermediário | Sweller, J.; Cooper, G. A. (1985). *The use of worked examples as a substitute for problem solving in learning algebra. Cognition and Instruction, 2(1), 59–89.* |
| **Mapa conceitual** (`mapa-conceitual`) | Estudar, Ensinar, Pesquisar | Intermediário | Novak, J. D.; Cañas, A. J. (2008). *The Theory Underlying Concept Maps and How to Construct and Use Them. Technical Report IHMC CmapTools 2006-01 Rev 01-2008, Florida Institute for Human and Machine Cognition.* |
| **Objetivos por nível (Bloom)** (`objetivos-bloom`) | Ensinar, Estudar | Intermediário | Anderson, L. W.; Krathwohl, D. R. (orgs.) (2001). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives. Nova York: Longman.* |
| **Planejamento reverso de unidade** (`planejamento-reverso`) | Ensinar | Mais capaz | Wiggins, G.; McTighe, J. (1998). *Understanding by Design. Alexandria, VA: ASCD (2ª ed. ampliada, 2005).* |
| **Rubrica de avaliação** (`rubrica`) | Ensinar, Estudar | Intermediário | Brookhart, S. M. (2013). *How to Create and Use Rubrics for Formative Assessment and Grading. Alexandria, VA: ASCD.* |
| **Checagem rápida de fim de aula** (`checagem-formativa`) | Ensinar | Rápido | Black, P.; Wiliam, D. (1998). *Assessment and Classroom Learning. Assessment in Education: Principles, Policy & Practice, 5(1), 7–74.* |
| **Aula invertida** (`aula-invertida`) | Ensinar | Intermediário | Bergmann, J.; Sams, A. (2012). *Flip Your Classroom: Reach Every Student in Every Class Every Day. Eugene, OR / Alexandria, VA: ISTE / ASCD.* |
| **Pergunta de pesquisa (PICO)** (`pergunta-pico`) | Pesquisar, Trabalho | Rápido | Richardson, W. S.; Wilson, M. C.; Nishikawa, J.; Hayward, R. S. (1995). *The well-built clinical question: a key to evidence-based decisions. ACP Journal Club, 123(3), A12–A13.* |
| **Triagem de fontes (estilo PRISMA)** (`triagem-prisma`) | Pesquisar | Mais capaz | Page, M. J.; McKenzie, J. E.; Bossuyt, P. M. et al. (2021). *The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ, 372, n71.* |
| **Matriz de síntese** (`matriz-sintese`) | Pesquisar, Trabalho | Mais capaz | Garrard, J. (1999). *Health Sciences Literature Review Made Easy: The Matrix Method. Gaithersburg, MD: Aspen (edições seguintes pela Jones & Bartlett).* |
| **Análise temática de falas** (`analise-tematica`) | Pesquisar, Trabalho | Mais capaz | Braun, V.; Clarke, V. (2006). *Using thematic analysis in psychology. Qualitative Research in Psychology, 3(2), 77–101.* |
| **Resumo executivo (pirâmide)** (`resumo-executivo`) | Trabalho, Pesquisar | Intermediário | Minto, B. (1987). *The Pyramid Principle: Logic in Writing and Thinking (edição de 1987, reeditada sem alterações em 2002; versões anteriores circularam como material de treinamento).* |
| **Pré-mortem de uma decisão** (`pre-mortem`) | Trabalho | Intermediário | Klein, G. (2007). *Performing a Project Premortem. Harvard Business Review, 85(9), 18–19.* |
| **Hipóteses concorrentes** (`hipoteses-concorrentes`) | Trabalho, Pesquisar | Mais capaz | Heuer, R. J., Jr. (1999). *Psychology of Intelligence Analysis. Washington, DC: Center for the Study of Intelligence, CIA (cap. 8, Analysis of Competing Hypotheses).* |
| **Ideia que gruda** (`ideia-memoravel`) | Ensinar, Trabalho | Rápido | Heath, C.; Heath, D. (2007). *Made to Stick: Why Some Ideas Survive and Others Die. Nova York: Random House.* |
| **Reflexão da semana** (`reflexao-semana`) | Estudar, Ensinar, Pesquisar, Trabalho | Rápido | Zimmerman, B. J. (2002). *Becoming a Self-Regulated Learner: An Overview. Theory Into Practice, 41(2), 64–70.* |

## Terceira leva: crítica das fontes e estudo com vídeo (16 prompts)

Acrescentada em 24/11/2026 a partir de uma análise de bibliotecas de prompts para NotebookLM e Gemini. Entrou só o que a Biblioteca ainda não tinha e que fica melhor com o Tusab: citação por minuto de vídeo, memória entre conversas (flashcards e Materiais) e várias fontes no mesmo projeto. As referências foram conferidas uma a uma; onde a obra é um guia e não uma pesquisa, a própria prévia diz isso.

| Prompt | Para quê | Público | Modelo | Base |
|---|---|---|---|---|
| **Inventário de afirmações** (`inventario-afirmacoes`) | Cada afirmação das fontes classificada como achado, suposição ou repetição de outro autor. | Pesquisar, Trabalho | Mais capaz | Toulmin, S. (1958). *The Uses of Argument. Cambridge: Cambridge University Press (edição atualizada em 2003).* |
| **Consenso e voz minoritária** (`consenso-minoria`) | O que todas as fontes sustentam, o que só uma diz e por que a minoria pode ter razão. | Pesquisar, Trabalho | Mais capaz | Wineburg, S. S. (1991). *Historical problem solving: A study of the cognitive processes used in the evaluation of documentary and pictorial evidence. Journal of Educational Psychology, 83(1), 73–87.* |
| **Mesma palavra, sentidos diferentes** (`glossario-divergente`) | Termos que as fontes usam com significados diferentes, lado a lado. | Pesquisar, Estudar | Intermediário | — |
| **Rastro da origem** (`rastro-origem`) | Quem disse primeiro e quem só repete, para saber em que dado tudo se apoia. | Pesquisar, Trabalho | Mais capaz | Wineburg, S.; McGrew, S. (2019). *Lateral reading and the nature of expertise: Reading less and learning more when evaluating digital information. Teachers College Record, 121(11), 1–40.* |
| **Como a posição mudou** (`evolucao-posicao`) | A mudança de opinião de um autor ou do campo ao longo do tempo, pelas datas das fontes. | Pesquisar, Trabalho | Intermediário | — |
| **Teste de estresse da conclusão** (`teste-estresse`) | A evidência que mais enfraqueceria a conclusão principal, e se a base já tem algo assim. | Pesquisar, Trabalho | Mais capaz | Lord, C. G.; Lepper, M. R.; Preston, E. (1984). *Considering the opposite: A corrective strategy for social judgment. Journal of Personality and Social Psychology, 47(6), 1231–1243.* |
| **Métodos e amostra** (`metodos-amostra`) | Para cada estudo da base: pergunta, método, amostra, período e limites declarados. | Pesquisar | Intermediário | Greenhalgh, T. (1997). *How to read a paper: Getting your bearings (deciding what the paper is about). BMJ, 315(7102), 243–246.* |
| **Auditoria do meu texto** (`auditar-meu-texto`) | Você cola o seu texto e cada frase é conferida com a base, com a citação que falta. | Pesquisar, Trabalho, Estudar | Mais capaz | — |
| **Anotações Cornell** (`notas-cornell`) | Notas por trecho do vídeo ou do PDF, perguntas-guia na margem e resumo no fim. | Estudar | Intermediário | Pauk, W.; Owens, R. J. Q. (2010). *How to Study in College (10ª ed.). Boston: Wadsworth, Cengage Learning.* |
| **Simulado com diagnóstico** (`simulado-diagnostico`) | Prova curta misturando formatos; no fim, nota por assunto e flashcards do que você errou. | Estudar | Intermediário | Dunlosky, J.; Rawson, K. A.; Marsh, E. J.; Nathan, M. J.; Willingham, D. T. (2013). *Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. Psychological Science in the Public Interest, 14(1), 4–58.* |
| **Cobertura do edital ou da ementa** (`cobertura-edital`) | Você cola o edital ou a ementa; cada tópico é marcado como bem coberto, fraco ou ausente na base. | Estudar, Ensinar | Mais capaz | Biggs, J. (1996). *Enhancing teaching through constructive alignment. Higher Education, 32(3), 347–364.* |
| **Tutor socrático** (`tutor-socratico`) | A IA não dá a resposta: faz perguntas, uma por vez, até você chegar lá. | Estudar | Intermediário | Paul, R.; Elder, L. (2006). *The Thinker's Guide to the Art of Socratic Questioning. Foundation for Critical Thinking.* |
| **Ponte entre dois temas** (`ponte-entre-temas`) | Ligações inesperadas entre dois assuntos da base: princípios em comum e onde a analogia falha. | Estudar, Pesquisar | Mais capaz | Gentner, D.; Loewenstein, J.; Thompson, L. (2003). *Learning and transfer: A general role for analogical encoding. Journal of Educational Psychology, 95(2), 393–408.* |
| **Assistir só o essencial** (`trilha-de-trechos`) | Uma "playlist de momentos": os trechos de vídeo a ver, em ordem, dentro do seu tempo. | Estudar, Ensinar | Rápido | Mayer, R. E. (2009). *Multimedia Learning (2ª ed.). New York: Cambridge University Press.* |
| **Mesmo conteúdo, outro público** (`outro-publico`) | O mesmo assunto em três versões: criança, colega da área e gestor. | Ensinar, Trabalho | Rápido | — |
| **Aula a partir de um vídeo** (`aula-de-um-video`) | Transforma um vídeo da base num roteiro de aula com cortes, pausas para pergunta e atividade. | Ensinar | Intermediário | Brame, C. J. (2016). *Effective educational videos: Principles and guidelines for maximizing student learning from video content. CBE—Life Sciences Education, 15(4), es6.* |

Alguns pedidos esperam o usuário: **Auditoria do meu texto** e **Cobertura do edital ou da ementa** pedem para colar o texto na conversa; **Tutor socrático** e **Simulado com diagnóstico** fazem uma pergunta por vez. Em **Assistir só o essencial**, a quantidade é o tempo disponível, em minutos (até 240).

## Quarta leva: elaboração, espaçamento e vídeo com pausas (6 prompts)

Saiu da mesma pesquisa de referências (24/11/2026). Todos têm referência conferida.

| Prompt | Para quê | Público | Modelo | Base |
|---|---|---|---|---|
| **Por que isso é verdade?** (`por-que-e-assim`) | A IA pergunta "por quê?" sobre os fatos centrais e compara a sua explicação com a base. | Estudar | Intermediário | Pressley, M.; McDaniel, M. A.; Turnure, J. E.; Wood, E.; Ahmad, M. (1987). *Generation and precision of elaboration: Effects on intentional and incidental learning. Journal of Experimental Psychology: Learning, Memory, and Cognition, 13(2), 291–300.* |
| **Calendário de revisões até a prova** (`calendario-revisao`) | Sessões e revisões com intervalos calculados pelo prazo. | Estudar | Intermediário | Cepeda, N. J.; Vul, E.; Rohrer, D.; Wixted, J. T.; Pashler, H. (2008). *Spacing effects in learning: A temporal ridgeline of optimal retention. Psychological Science, 19(11), 1095–1102.* |
| **Quanto você tem certeza?** (`certeza-antes-da-resposta`) | Você dá a sua certeza antes de cada resposta; os erros com muita certeza viram prioridade. | Estudar | Intermediário | Butterfield, B.; Metcalfe, J. (2001). *Errors committed with high confidence are hypercorrected. Journal of Experimental Psychology: Learning, Memory, and Cognition, 27(6), 1491–1494.* |
| **Ideias erradas que as fontes corrigem** (`desfazer-equivocos`) | Cada equívoco apresentado, refutado e trocado pela explicação certa. | Estudar, Ensinar | Intermediário | Tippett, C. D. (2010). *Refutation text in science education: A review of two decades of research. International Journal of Science and Mathematics Education, 8(6), 951–970.* |
| **Perguntas para discussão em duplas** (`perguntas-conceituais`) | Perguntas de conceito para votação e discussão entre colegas. | Ensinar | Mais capaz | Crouch, C. H.; Mazur, E. (2001). *Peer Instruction: Ten years of experience and results. American Journal of Physics, 69(9), 970–977.* |
| **Assistir com perguntas no meio** (`video-com-pausas`) | O vídeo em partes, com 2 perguntas entre uma parte e a próxima. | Estudar | Rápido | Szpunar, K. K.; Khan, N. Y.; Schacter, D. L. (2013). *Interpolated memory tests reduce mind wandering and improve learning of online lectures. Proceedings of the National Academy of Sciences, 110(16), 6313–6317.* |

Em **Calendário de revisões até a prova**, a quantidade é o número de dias até a prova (até 365).

## Trilhas: prompts em sequência {#trilhas}

Uma trilha encadeia prompts da Biblioteca e **guarda o passo de cada projeto** (`data/config/trilhas.json`), com o tema escolhido no começo. O resultado de cada passo fica em Materiais, como qualquer prompt. Código: `tusab-mcp/src/nucleo/trilhas.js`.

| Trilha | Passos |
|---|---|
| **Aprender um tema do zero** (`trilha-aprender-do-zero`) | Pré-teste (antes de estudar) → Assistir só o essencial → Anotações Cornell → Lembrar sem olhar → Simulado com diagnóstico → revisar-hoje |
| **Concurso e provas** (`trilha-concurso`) | Cobertura do edital ou da ementa → plano-estudo → Anotações Cornell → Simulado com diagnóstico → revisar-hoje |
| **Revisão de pesquisa** (`trilha-revisao-pesquisa`) | Pergunta de pesquisa (PICO) → Triagem de fontes (estilo PRISMA) → Métodos e amostra → Matriz de síntese → Consenso e voz minoritária → Teste de estresse da conclusão → nota-tecnica |
| **Checar um texto antes de publicar** (`trilha-checar-texto`) | Inventário de afirmações → Rastro da origem → Auditoria do meu texto |
| **Preparar uma aula** (`trilha-preparar-aula`) | Objetivos por nível (Bloom) → Aula a partir de um vídeo → Checagem rápida de fim de aula → Rubrica de avaliação |

- **No Claude:** cada trilha tem um atalho no "+" (`trilha-<id>`). Ele entrega o pedido do passo atual e, no fim, pede à IA que pergunte se o passo pode ser marcado como feito; com o OK do usuário, a IA registra pela ferramenta `tusab_trilha` (ações `ver`, `concluir`, `voltar`, `reiniciar`) e recebe o pedido do próximo passo.
- **Na tela:** aba **Trilhas** da Biblioteca. Cada trilha mostra os passos (feito, atual, a fazer), o campo de tema e os botões **Começar**, **Copiar o passo N**, **Concluí este passo**, **Voltar um passo** e **Recomeçar**. Tela e Claude usam o mesmo andamento.

## Favoritos, mais usados e o menu "+" {#favoritos}

Com 63 prompts, o "+" do Claude ficaria longo. Por padrão ele mostra:

- os **favoritos** (a estrela de cada cartão da Biblioteca);
- os **8 mais usados** (cada cópia na tela e cada escolha no "+" conta um uso; a cópia para IA no navegador não conta de novo);
- enquanto não houver favorito nem uso, uma **seleção inicial** de 8 prompts (resumo, flashcards, revisar hoje, quiz, explicar de forma simples, resposta verificável, anotações Cornell e simulado com diagnóstico);
- **sempre:** as 5 trilhas, os prompts do usuário e "Abrir o Tusab".

Na Biblioteca, **Menu + do Claude** troca entre *favoritos e mais usados* e *todos os prompts*. A aba **Favoritos e mais usados** lista os mesmos, e o selo "no +" marca o que aparece no menu. A troca vale na hora, sem reiniciar. Favoritos e contagem ficam só neste computador, em `data/config/prompts_uso.json`.

## Filtros e modelo sugerido

- **Para quê:** as abas da Biblioteca filtram por público — Estudar, Ensinar, Pesquisar e Trabalho e decisões (campo `publicos`; um prompt pode estar em mais de uma) — além de Todos e Meus prompts. O Tusab tem **perfil único** (o de acesso completo): a separação que antes era feita por perfil virou filtro.
- **Modelo sugerido:** cada prompt tem um nível (campo `nivel`), mostrado como selo com ícone e texto: **Rápido · Haiku** (`leve`), **Intermediário · Sonnet** (`equilibrado`) e **Mais capaz · Opus** (`avancado`). É uma sugestão de custo-benefício pela natureza da tarefa (pontos centrais × várias fontes e raciocínio longo); quem escolhe o modelo é o usuário, na própria ferramenta de IA.

## IA no navegador {#ia-no-navegador}

Uma IA no navegador (Claude.ai, ChatGPT, Gemini) não alcança o servidor local do Tusab. No aviso de "copiado", **Abrir no navegador** copia o pedido de novo na versão para o navegador (`POST /api/prompts/montar` com `navegador: true`): o pedido vai com até 12 trechos da base dentro (os da busca pelo tema; sem tema, ou com poucos resultados, um panorama com os primeiros trechos de cada fonte), até 1.500 caracteres por trecho e 24.000 no total, e com regras para usar só esses trechos e citá-los como [n]. Prompts que dependem das ferramentas (Revisar hoje, Digest da semana) não têm essa versão.

## Regras fixas acrescentadas pelo Tusab

Ao montar o texto final, o Tusab acrescenta ao pedido as regras de busca e citação, no idioma da tela:

> Pesquise a base do Tusab no projeto "\{projeto\}" com tusab_buscar (e tusab_ler_fonte quando precisar de contexto). Use só o que estiver nos trechos; se faltar informação, diga o que faltou. Cite cada afirmação com o título da fonte e, em vídeo, o minuto com o link (▶ MM:SS); em PDF, a página indicada no trecho ([Página N]) — se o trecho não indicar a página, não invente.

- As regras **não são editáveis** e valem também para os prompts criados pelo usuário.
- Duas exceções: **Revisar hoje** e **Digest da semana** já dizem no próprio pedido quais ferramentas usar (`tusab_revisao_hoje`/`tusab_registrar_revisao` e `tusab_novidades_semana`), então não recebem as regras.
- Flashcards e Resumo terminam pedindo que a IA grave o resultado com `tusab_salvar_estudo`. Os prompts que produzem um documento (quiz, mapa mental, plano de estudo, prova, plano de aula, exercícios, revisão de literatura, ficha de leitura, linha do tempo, nota técnica, roteiro e post) pedem que ela guarde o material completo como `documento`, para abrir depois na aba **Materiais**.
- Todo pedido começa com uma checagem de conexão: se as ferramentas do Tusab não estiverem disponíveis na conversa, a IA deve dizer que o Tusab não está conectado, em vez de responder de memória. Isso vale também para os prompts do usuário e para quem cola o pedido numa IA no navegador, que não alcança o Tusab local.

## Meus prompts

O usuário cria prompts próprios na tela, do zero ou com "Duplicar e editar" a partir de um pronto.

- Guardados em `data/config/prompts_usuario.json`; limite de 50 prompts, título até 80 caracteres, descrição até 200, pedido até 4.000.
- Marcadores no texto do pedido:
  - `{tema_frase}` vira ` sobre "<tema>"` (ou nada, se o tema ficar vazio) e faz o campo **tema** aparecer;
  - `{quantidade}` vira o número informado (padrão 10) e faz o campo **quantidade** aparecer.
- **Pastas:** cada prompt pode ter uma pasta (até 40 caracteres). A pasta pode ser renomeada ou desfeita (os prompts continuam). No "+" do Claude, o título aparece como `Pasta › Título`.
- Criar, alterar ou excluir um prompt na tela atualiza o "+" do Claude **na hora, sem reiniciar** (o servidor avisa a ferramenta de IA que a lista de prompts mudou).

## Na tela

- Busca por nome, descrição, texto ou pasta, sem diferença de acento.
- Cada cartão tem **Copiar** e **Ajustar** (prévia editável). Se o navegador negar a cópia automática, a prévia abre para copiar à mão.
- **Aviso de copiado:** depois de copiar, um aviso oferece abrir o app do Claude (endereço `claude://`) ou uma IA no navegador (Claude.ai, ChatGPT ou Gemini; a escolha fica lembrada no navegador). O aviso lembra que, no navegador, a IA não acessa o Tusab deste computador: o pedido copiado funciona como texto, mas as ferramentas MCP só existem na ferramenta de IA onde o Tusab está instalado.
- No Repositório, o botão **Pedir à IA** de cada projeto copia pedidos frequentes já preenchidos com o projeto, ou abre a Biblioteca nesse projeto.
- O botão **Economia de tokens** da Biblioteca abre a janela descrita em [Economia de tokens](/funcionalidades/economia-de-tokens).
