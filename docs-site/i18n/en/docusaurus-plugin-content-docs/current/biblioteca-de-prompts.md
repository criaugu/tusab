---
id: biblioteca-de-prompts
title: Prompt Library
sidebar_label: Prompt Library
slug: /biblioteca-de-prompts
---

# Prompt Library

Tusab doesn't generate flashcards, quizzes or summaries: the user's AI does. Tusab delivers the **ready-made request**, already tied to the base (search the project, cite the source, don't make things up), and **keeps** what needs memory across conversations (flashcards and spaced repetition).

A single list (`tusab-mcp/src/nucleo/prompts.js`) feeds two places:

- Claude Desktop's **"+" menu** (MCP prompts), where the user picks the prompt and fills in the project and, where applicable, topic and quantity;
- the **Prompt Library** tab of the [Tusab screen](/tela) (`GET /api/prompts`), to copy and paste into any AI.

## The 21 built-in prompts

| Category | Prompts | Fields |
|---|---|---|
| **Study** | Flashcards · Review today · Multiple-choice quiz · Study summary · Mind map (Mermaid) · Explain it simply · Study plan | project; topic and quantity depending on the prompt |
| **Teach** | Exam with answer key · Lesson plan · Exercises by level | project, topic; quantity in the exam and exercises |
| **Research** | Material review · Compare sources and contradictions · Gaps in the base · Reading notes per source · Timeline · Key quotes | project, topic; quantity in the quotes |
| **Decide** | Verifiable answer · Briefing note | project, topic |
| **Create content** | Video script · LinkedIn post | project, topic |
| **Keep up** | Weekly digest | project |

Default quantities: 8 in the quiz, 7 days in the study plan, 10 in the exam and the quotes, 9 in the exercises. The value given is kept between 1 and 50. The topic is cut at 200 characters and the project name at 120.

Besides these, the `abrir_tusab` shortcut ("Open Tusab") opens the screen. Adding the 20 techniques and the 22 prompts of the third and fourth batches (next sections), the Library has **63 prompts** and **5 trails**. Claude's "+" menu does not show them all: by default, the favorites and the most used (see [Favorites, most used and the "+" menu](#favoritos)).

## Evidence-based techniques (20 prompts)

Since 2.0.0, the Library has 20 prompts based on learning, teaching, research and decision techniques with evidence or established practice. Each shows its reference on the card ("Based on: author, year") and, in the preview, the work and how it applies. Code: `tusab-mcp/src/nucleo/prompts-catalogo.js`.

| Prompt | What for | Model | Based on |
|---|---|---|---|
| **Pretest (before studying)** (`pre-teste`) | Study | Fast | Richland, L. E.; Kornell, N.; Kao, L. S. (2009). *The pretesting effect: Do unsuccessful retrieval attempts enhance learning? Journal of Experimental Psychology: Applied, 15(3), 243–257.* |
| **Recall without looking** (`recordar-livre`) | Study | Balanced | Roediger, H. L., III; Karpicke, J. D. (2006). *Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.* |
| **Explain it in my own words** (`autoexplicacao`) | Study, Teach | Balanced | Chi, M. T. H.; de Leeuw, N.; Chiu, M.-H.; LaVancher, C. (1994). *Eliciting self-explanations improves understanding. Cognitive Science, 18(3), 439–477.* |
| **Mixed practice** (`pratica-intercalada`) | Study, Teach | Balanced | Rohrer, D.; Taylor, K. (2007). *The shuffling of mathematics problems improves learning. Instructional Science, 35(6), 481–498.* |
| **Step-by-step worked example** (`exemplo-resolvido`) | Study, Teach | Balanced | Sweller, J.; Cooper, G. A. (1985). *The use of worked examples as a substitute for problem solving in learning algebra. Cognition and Instruction, 2(1), 59–89.* |
| **Concept map** (`mapa-conceitual`) | Study, Teach, Research | Balanced | Novak, J. D.; Cañas, A. J. (2008). *The Theory Underlying Concept Maps and How to Construct and Use Them. Technical Report IHMC CmapTools 2006-01 Rev 01-2008, Florida Institute for Human and Machine Cognition.* |
| **Objectives by level (Bloom)** (`objetivos-bloom`) | Teach, Study | Balanced | Anderson, L. W.; Krathwohl, D. R. (orgs.) (2001). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives. Nova York: Longman.* |
| **Backward unit design** (`planejamento-reverso`) | Teach | Most capable | Wiggins, G.; McTighe, J. (1998). *Understanding by Design. Alexandria, VA: ASCD (2ª ed. ampliada, 2005).* |
| **Assessment rubric** (`rubrica`) | Teach, Study | Balanced | Brookhart, S. M. (2013). *How to Create and Use Rubrics for Formative Assessment and Grading. Alexandria, VA: ASCD.* |
| **Quick end-of-class check** (`checagem-formativa`) | Teach | Fast | Black, P.; Wiliam, D. (1998). *Assessment and Classroom Learning. Assessment in Education: Principles, Policy & Practice, 5(1), 7–74.* |
| **Flipped lesson** (`aula-invertida`) | Teach | Balanced | Bergmann, J.; Sams, A. (2012). *Flip Your Classroom: Reach Every Student in Every Class Every Day. Eugene, OR / Alexandria, VA: ISTE / ASCD.* |
| **Research question (PICO)** (`pergunta-pico`) | Research, Work | Fast | Richardson, W. S.; Wilson, M. C.; Nishikawa, J.; Hayward, R. S. (1995). *The well-built clinical question: a key to evidence-based decisions. ACP Journal Club, 123(3), A12–A13.* |
| **Source screening (PRISMA style)** (`triagem-prisma`) | Research | Most capable | Page, M. J.; McKenzie, J. E.; Bossuyt, P. M. et al. (2021). *The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ, 372, n71.* |
| **Synthesis matrix** (`matriz-sintese`) | Research, Work | Most capable | Garrard, J. (1999). *Health Sciences Literature Review Made Easy: The Matrix Method. Gaithersburg, MD: Aspen (edições seguintes pela Jones & Bartlett).* |
| **Thematic analysis of conversations** (`analise-tematica`) | Research, Work | Most capable | Braun, V.; Clarke, V. (2006). *Using thematic analysis in psychology. Qualitative Research in Psychology, 3(2), 77–101.* |
| **Executive summary (pyramid)** (`resumo-executivo`) | Work, Research | Balanced | Minto, B. (1987). *The Pyramid Principle: Logic in Writing and Thinking (edição de 1987, reeditada sem alterações em 2002; versões anteriores circularam como material de treinamento).* |
| **Pre-mortem of a decision** (`pre-mortem`) | Work | Balanced | Klein, G. (2007). *Performing a Project Premortem. Harvard Business Review, 85(9), 18–19.* |
| **Competing hypotheses** (`hipoteses-concorrentes`) | Work, Research | Most capable | Heuer, R. J., Jr. (1999). *Psychology of Intelligence Analysis. Washington, DC: Center for the Study of Intelligence, CIA (cap. 8, Analysis of Competing Hypotheses).* |
| **An idea that sticks** (`ideia-memoravel`) | Teach, Work | Fast | Heath, C.; Heath, D. (2007). *Made to Stick: Why Some Ideas Survive and Others Die. Nova York: Random House.* |
| **Weekly reflection** (`reflexao-semana`) | Study, Teach, Research, Work | Fast | Zimmerman, B. J. (2002). *Becoming a Self-Regulated Learner: An Overview. Theory Into Practice, 41(2), 64–70.* |

## Third batch: source criticism and studying with video (16 prompts)

Added on 24/11/2026 after an analysis of prompt libraries for NotebookLM and Gemini. Only what the Library did not have yet, and what works better with Tusab, made it in: citation by video minute, memory across conversations (flashcards and Materials) and several sources in the same project. The references were checked one by one; where the work is a guide rather than research, the preview says so.

| Prompt | What for | Audience | Model | Basis |
|---|---|---|---|---|
| **Claim inventory** (`inventario-afirmacoes`) | Each claim in the sources classified as a finding, an assumption or a repetition of another author. | Research, Work | Most capable | Toulmin, S. (1958). *The Uses of Argument. Cambridge: Cambridge University Press (edição atualizada em 2003).* |
| **Consensus and minority voice** (`consenso-minoria`) | What all the sources support, what only one says and why the minority may be right. | Research, Work | Most capable | Wineburg, S. S. (1991). *Historical problem solving: A study of the cognitive processes used in the evaluation of documentary and pictorial evidence. Journal of Educational Psychology, 83(1), 73–87.* |
| **Same word, different meanings** (`glossario-divergente`) | Terms the sources use with different meanings, side by side. | Research, Study | Balanced | — |
| **Trace the origin** (`rastro-origem`) | Who said it first and who only repeats it, to know what data everything rests on. | Research, Work | Most capable | Wineburg, S.; McGrew, S. (2019). *Lateral reading and the nature of expertise: Reading less and learning more when evaluating digital information. Teachers College Record, 121(11), 1–40.* |
| **How the position changed** (`evolucao-posicao`) | How an author's or the field's view changed over time, by the sources' dates. | Research, Work | Balanced | — |
| **Stress-test the conclusion** (`teste-estresse`) | The evidence that would weaken the main conclusion the most, and whether the base already has something like it. | Research, Work | Most capable | Lord, C. G.; Lepper, M. R.; Preston, E. (1984). *Considering the opposite: A corrective strategy for social judgment. Journal of Personality and Social Psychology, 47(6), 1231–1243.* |
| **Methods and sample** (`metodos-amostra`) | For each study in the base: question, method, sample, period and stated limitations. | Research | Balanced | Greenhalgh, T. (1997). *How to read a paper: Getting your bearings (deciding what the paper is about). BMJ, 315(7102), 243–246.* |
| **Audit my text** (`auditar-meu-texto`) | You paste your text and each sentence is checked against the base, with the missing citation. | Research, Work, Study | Most capable | — |
| **Cornell notes** (`notas-cornell`) | Notes by video segment or PDF page, cue questions in the margin and a summary at the end. | Study | Balanced | Pauk, W.; Owens, R. J. Q. (2010). *How to Study in College (10ª ed.). Boston: Wadsworth, Cengage Learning.* |
| **Mock exam with diagnosis** (`simulado-diagnostico`) | A short exam mixing formats; at the end, a score by topic and flashcards of what you got wrong. | Study | Balanced | Dunlosky, J.; Rawson, K. A.; Marsh, E. J.; Nathan, M. J.; Willingham, D. T. (2013). *Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. Psychological Science in the Public Interest, 14(1), 4–58.* |
| **Syllabus coverage** (`cobertura-edital`) | You paste the syllabus or exam notice; each topic is marked as well covered, weak or missing in the base. | Study, Teach | Most capable | Biggs, J. (1996). *Enhancing teaching through constructive alignment. Higher Education, 32(3), 347–364.* |
| **Socratic tutor** (`tutor-socratico`) | The AI does not give the answer: it asks questions, one at a time, until you get there. | Study | Balanced | Paul, R.; Elder, L. (2006). *The Thinker's Guide to the Art of Socratic Questioning. Foundation for Critical Thinking.* |
| **Bridge between two topics** (`ponte-entre-temas`) | Unexpected links between two subjects in the base: shared principles and where the analogy breaks. | Study, Research | Most capable | Gentner, D.; Loewenstein, J.; Thompson, L. (2003). *Learning and transfer: A general role for analogical encoding. Journal of Educational Psychology, 95(2), 393–408.* |
| **Watch only the essentials** (`trilha-de-trechos`) | A "playlist of moments": the video segments to watch, in order, within your time. | Study, Teach | Fast | Mayer, R. E. (2009). *Multimedia Learning (2ª ed.). New York: Cambridge University Press.* |
| **Same content, another audience** (`outro-publico`) | The same subject in three versions: a child, a colleague in the field and a manager. | Teach, Work | Fast | — |
| **A class from one video** (`aula-de-um-video`) | Turns a video from the base into a lesson plan with clips, question pauses and an activity. | Teach | Balanced | Brame, C. J. (2016). *Effective educational videos: Principles and guidelines for maximizing student learning from video content. CBE—Life Sciences Education, 15(4), es6.* |

Some requests wait for the user: **Audit my text** and **Syllabus coverage** ask the user to paste the text into the conversation; **Socratic tutor** and **Mock exam with diagnosis** ask one question at a time. In **Watch only the essentials**, the quantity is the time available, in minutes (up to 240).

## Fourth batch: elaboration, spacing and video with pauses (6 prompts)

From the same reference research (24/11/2026). All of them have a checked reference.

| Prompt | What for | Audience | Model | Basis |
|---|---|---|---|---|
| **Why is this true?** (`por-que-e-assim`) | The AI asks "why?" about the central facts and compares your explanation with the base. | Study | Balanced | Pressley, M.; McDaniel, M. A.; Turnure, J. E.; Wood, E.; Ahmad, M. (1987). *Generation and precision of elaboration: Effects on intentional and incidental learning. Journal of Experimental Psychology: Learning, Memory, and Cognition, 13(2), 291–300.* |
| **Review calendar up to the exam** (`calendario-revisao`) | Sessions and reviews with intervals calculated from the deadline. | Study | Balanced | Cepeda, N. J.; Vul, E.; Rohrer, D.; Wixted, J. T.; Pashler, H. (2008). *Spacing effects in learning: A temporal ridgeline of optimal retention. Psychological Science, 19(11), 1095–1102.* |
| **How sure are you?** (`certeza-antes-da-resposta`) | You give your confidence before each answer; high-confidence mistakes become the priority. | Study | Balanced | Butterfield, B.; Metcalfe, J. (2001). *Errors committed with high confidence are hypercorrected. Journal of Experimental Psychology: Learning, Memory, and Cognition, 27(6), 1491–1494.* |
| **Misconceptions the sources correct** (`desfazer-equivocos`) | Each misconception stated, refuted and replaced by the right explanation. | Study, Teach | Balanced | Tippett, C. D. (2010). *Refutation text in science education: A review of two decades of research. International Journal of Science and Mathematics Education, 8(6), 951–970.* |
| **Questions for pair discussion** (`perguntas-conceituais`) | Concept questions for voting and discussion among classmates. | Teach | Most capable | Crouch, C. H.; Mazur, E. (2001). *Peer Instruction: Ten years of experience and results. American Journal of Physics, 69(9), 970–977.* |
| **Watch with questions in between** (`video-com-pausas`) | The video in parts, with 2 questions between one part and the next. | Study | Fast | Szpunar, K. K.; Khan, N. Y.; Schacter, D. L. (2013). *Interpolated memory tests reduce mind wandering and improve learning of online lectures. Proceedings of the National Academy of Sciences, 110(16), 6313–6317.* |

In **Review calendar up to the exam**, the quantity is the number of days until the exam (up to 365).

## Trails: prompts in sequence {#trilhas}

A trail chains prompts from the Library and **saves the step of each project** (`data/config/trilhas.json`), with the topic chosen at the start. The result of each step goes to Materials, like any prompt. Code: `tusab-mcp/src/nucleo/trilhas.js`.

| Trail | Steps |
|---|---|
| **Learn a topic from scratch** (`trilha-aprender-do-zero`) | Pretest (before studying) → Watch only the essentials → Cornell notes → Recall without looking → Mock exam with diagnosis → revisar-hoje |
| **Exams and public tests** (`trilha-concurso`) | Syllabus coverage → plano-estudo → Cornell notes → Mock exam with diagnosis → revisar-hoje |
| **Research review** (`trilha-revisao-pesquisa`) | Research question (PICO) → Source screening (PRISMA style) → Methods and sample → Synthesis matrix → Consensus and minority voice → Stress-test the conclusion → nota-tecnica |
| **Check a text before publishing** (`trilha-checar-texto`) | Claim inventory → Trace the origin → Audit my text |
| **Prepare a class** (`trilha-preparar-aula`) | Objectives by level (Bloom) → A class from one video → Quick end-of-class check → Assessment rubric |

- **In Claude:** each trail has a shortcut in the "+" menu (`trilha-<id>`). It delivers the request for the current step and, at the end, asks the AI to check whether the step can be marked as done; with the user's OK, the AI records it with the `tusab_trilha` tool (actions `ver`, `concluir`, `voltar`, `reiniciar`) and gets the request for the next step.
- **On the screen:** the **Trails** tab of the Library. Each trail shows its steps (done, current, to do), the topic field and the buttons **Start**, **Copy step N**, **I finished this step**, **Go back one step** and **Start over**. The screen and Claude share the same progress.

## Favorites, most used and the "+" menu {#favoritos}

With 63 prompts, the Claude "+" menu would be long. By default it shows:

- the **favorites** (the star on each Library card);
- the **8 most used** (each copy on the screen and each pick in the "+" menu counts as a use; the copy for a browser AI does not count again);
- while there are no favorites or uses, an **initial selection** of 8 prompts (study summary, flashcards, review today, quiz, explain it simply, verifiable answer, Cornell notes and mock exam with diagnosis);
- **always:** the 5 trails, the user's own prompts and "Open Tusab".

In the Library, **Claude + menu** switches between *favorites and most used* and *all prompts*. The **Favorites and most used** tab lists the same prompts, and the "in +" badge marks what shows in the menu. The change applies right away, without restarting. Favorites and counts stay on this computer only, in `data/config/prompts_uso.json`.

## Filters and suggested model

- **What for:** the Library tabs filter by audience — Study, Teach, Research and Work and decisions (field `publicos`; a prompt can be in more than one) — plus All and My prompts. Tusab has a **single profile** (the full-access one): what used to be split by profile became a filter.
- **Suggested model:** each prompt has a level (field `nivel`), shown as a badge with icon and text: **Fast · Haiku** (`leve`), **Balanced · Sonnet** (`equilibrado`) and **Most capable · Opus** (`avancado`). It is a cost-benefit suggestion based on the kind of task (central points × several sources and long reasoning); the user chooses the model in the AI tool.

## Browser AI {#ia-no-navegador}

A browser AI (Claude.ai, ChatGPT, Gemini) cannot reach Tusab's local server. In the "copied" notice, **Open in browser** copies the request again in its browser version (`POST /api/prompts/montar` with `navegador: true`): the request carries up to 12 excerpts from the base (those found for the topic; with no topic or few results, an overview with the first excerpts of each source), up to 1,500 characters per excerpt and 24,000 in total, with rules to use only those excerpts and cite them as [n]. Prompts that depend on the tools (Review today, Weekly digest) have no browser version.

## Fixed rules added by Tusab

When building the final text, Tusab appends the search and citation rules to the request, in the screen's language:

> Search the Tusab base in the project "\{projeto\}" with tusab_buscar (and tusab_ler_fonte when you need more context). Use only what is in the excerpts; if information is missing, say what is missing. Cite every statement with the source title and, for videos, the minute with the link (▶ MM:SS); for PDFs, the page marked in the excerpt ([Página N]) — if the excerpt does not show the page, do not make it up.

- The rules **are not editable** and also apply to prompts created by the user.
- Two exceptions: **Review today** and **Weekly digest** already state which tools to use in the request itself (`tusab_revisao_hoje`/`tusab_registrar_revisao` and `tusab_novidades_semana`), so they don't get the rules.
- Flashcards and Study summary end by asking the AI to save the result with `tusab_salvar_estudo`. The prompts that produce a document (quiz, mind map, study plan, test, lesson plan, exercises, literature review, reading sheet, timeline, technical note, script and post) ask it to save the complete material as `documento`, to open later in the **Materials** tab.
- Every request starts with a connection check: if the Tusab tools are not available in the conversation, the AI must say that Tusab is not connected instead of answering from memory. This also applies to the user's own prompts and to anyone who pastes the request into a browser AI, which cannot reach the local Tusab.

## My prompts

The user creates their own prompts on the screen, from scratch or with "Duplicate and edit" from a built-in one.

- Stored in `data/config/prompts_usuario.json`; limit of 50 prompts, title up to 80 characters, description up to 200, request up to 4,000.
- Placeholders in the request text:
  - `{tema_frase}` becomes ` about "<topic>"` (or nothing, if the topic is empty) and makes the **topic** field appear;
  - `{quantidade}` becomes the number given (default 10) and makes the **quantity** field appear.
- **Folders:** each prompt can have a folder (up to 40 characters). A folder can be renamed or dissolved (the prompts stay). In Claude's "+" menu, the title shows as `Folder › Title`.
- Creating, changing or deleting a prompt on the screen updates Claude's "+" menu **immediately, without restarting** (the server notifies the AI tool that the prompt list changed).

## On the screen

- Search by name, description, text or folder, accent-insensitive.
- Each card has **Copy** and **Adjust** (editable preview). If the browser denies automatic copying, the preview opens for copying by hand.
- **Copied notice:** after copying, a notice offers to open the Claude app (`claude://` address) or an AI in the browser (Claude.ai, ChatGPT or Gemini; the choice is remembered in the browser). The notice points out that, in the browser, the AI can't reach Tusab on this computer: the copied request works as text, but the MCP tools only exist in the AI tool where Tusab is installed.
- In the Repository, each project's **Ask the AI** button copies frequent requests already filled in with the project, or opens the Library on that project.
- The Library's **Token savings** button opens the window described in [Token savings](/funcionalidades/economia-de-tokens).
