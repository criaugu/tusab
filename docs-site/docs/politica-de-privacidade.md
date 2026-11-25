---
id: politica-de-privacidade
title: Política de Privacidade
sidebar_label: Política de Privacidade
slug: /politica-de-privacidade
description: Política de Privacidade do Tusab (LGPD e GDPR). Os dados ficam no computador do usuário; a CriAugu não recebe conteúdo, bases nem dados de uso.
---

# Política de Privacidade do Tusab

**Versão:** 2.0 · **Vigência:** a partir de novembro de 2026 (versão 2.0.0 do Tusab)
**Responsável:** CriAugu, CNPJ 65.131.075/0001-57 · **Contato:** [tusab@tusab.solutions](mailto:tusab@tusab.solutions)

Esta política vale para o Tusab a partir da versão 2.0.0, o conector local para o Claude e outras IAs. Para o app desktop descontinuado (versões 1.0.x), veja a [seção 9](#app-desktop).

## 1. O princípio: os dados ficam no seu computador

O Tusab funciona no seu computador. A **CriAugu não opera nenhum servidor** que receba o conteúdo da sua base, as suas conversas com a IA, os seus arquivos ou dados sobre como você usa o Tusab. Não há conta, login, telemetria, cookies de rastreamento nem sincronização em nuvem. A única exceção é o [feedback voluntário](#feedback-voluntario): só sai se você decidir enviar, depois de ver exatamente o que vai.

Esta política segue a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018) e, quando aplicável, o Regulamento Geral de Proteção de Dados da União Europeia (GDPR, Regulamento UE 2016/679).

## 2. O que o Tusab guarda, e onde

Tudo fica na pasta que você escolhe ao instalar (a "pasta do repositório"):

| Dado | Para quê |
|---|---|
| Transcrições do YouTube, documentos, textos, páginas web e resultados de fontes públicas que você adiciona | Formar a sua base de conhecimento |
| Arquivos originais (PDF, imagens, áudio etc.) | Permitir que a IA consulte o original |
| Índice de busca | Encontrar os trechos certos |
| Vetores dos trechos (só se você ligar a busca por significado com o Ollama, opção avançada) | Achar trechos de sentido parecido. Ficam em `data/vetores/` e saem quando a fonte é apagada, no reset total e quando a opção é desligada |
| Materiais de estudo e estado da revisão espaçada | Guardar o que a IA gera e lembrar as datas de revisão |
| Seus próprios pedidos (prompts), idioma, fila de extração e preferências | Configurar o Tusab |
| Contador de economia de tokens (só números somados) | Mostrar quanto a busca economizou |
| Contadores de uso (só números: ferramentas usadas, prompts, trilhas, dias de uso) e o estado do convite de feedback | Convidar para o feedback na hora certa e, se você quiser, enviar junto com ele |

A CriAugu não tem acesso a nenhum desses dados.

## 3. O que sai do seu computador

| Para onde | O quê | Quando |
|---|---|---|
| **A ferramenta de IA que você usa** (Claude Desktop, Claude Code, VS Code, Cursor, Gemini CLI, Codex etc.) e o serviço de IA por trás dela | Os trechos da base que a IA consultou, páginas de documentos e imagens que ela pediu (imagens sem metadados de localização), nomes de projetos e de fontes | Quando a IA usa uma ferramenta do Tusab |
| YouTube | Pedidos de legendas e de informações dos vídeos, feitos a partir do seu IP | Ao extrair um canal ou vídeo, ou ao verificar canais novos |
| Fontes públicas (bases de artigos, legislação, dados abertos) | O termo que você pesquisou | Ao fazer uma busca |
| Sites das páginas web que você adiciona | O pedido da página | Ao adicionar uma página |
| GitHub | Download da ferramenta yt-dlp e da soma de conferência | Só se o computador ainda não tiver o yt-dlp |
| Ollama **no seu próprio computador** (opção avançada) | O texto dos trechos e das perguntas, para calcular os vetores. Não sai do computador | Só se você ligar a busca por significado (`TUSAB_EMBEDDINGS=1`) |
| **CriAugu**, no coletor de feedback da CriAugu ([feedback voluntário](#feedback-voluntario)) | A nota, o comentário, o e-mail (se você informar) e, se você deixar marcado, os números de uso | Só quando você clica em Enviar no formulário de feedback |

**O que a ferramenta de IA faz com os trechos** (guardar, usar para treinar modelos, em que país ficam os servidores) segue os termos e a política de privacidade dessa ferramenta e do serviço de IA, e não os do Tusab. Você escolhe a ferramenta; leia a política dela. Esses serviços podem estar fora do Brasil, o que caracteriza transferência internacional de dados por iniciativa sua (LGPD, art. 33).

Para usar uma IA no navegador, o Tusab copia um pedido com trechos da base para a sua área de transferência. Nada é enviado até você colar o pedido na IA.

### Feedback voluntário {#feedback-voluntario}

De vez em quando (depois de concluir uma trilha, de guardar 5 materiais, de uma semana de uso ou numa versão nova; no máximo uma vez a cada 30 dias), a tela do Tusab convida você a dar uma nota e um comentário. Você também pode abrir o formulário pela Ajuda. Antes de enviar, você vê exatamente o que vai:

- a nota de 0 a 10 e o comentário, se escrever (pedimos que não escreva dados pessoais nem trechos dos seus documentos);
- o e-mail, só se você quiser resposta;
- se você deixar marcado, os **números de uso**: quantas vezes cada ferramenta foi usada, quais prompts e trilhas, quantos projetos, fontes e vídeos, versão, sistema e idioma. **Nunca** vão o conteúdo da base, as consultas, nomes de projeto, títulos ou pastas;
- um código aleatório da instalação, para juntar envios da mesma instalação sem identificar você.

O envio vai para o coletor da CriAugu (`coletor.criaugu.com`, na hospedagem contratada pela CriAugu na Hostinger, que atua como operadora), é guardado lá e chega por e-mail à caixa tusab@tusab.solutions. Se o envio direto falhar, o Tusab prepara o mesmo e-mail, que você manda se quiser. "Agora não" adia por 14 dias; "Não perguntar mais" desliga o convite de vez. Esses dados são usados só para melhorar o Tusab e responder a você, e são apagados a pedido pelo e-mail de contato.

Os detalhes técnicos estão em [Privacidade (detalhes técnicos)](/privacidade).

## 4. Bases legais

| Tratamento | Base legal |
|---|---|
| Montar e consultar a sua base no seu computador, para uso pessoal | Tratamento feito por pessoa natural para fins exclusivamente particulares e não econômicos, fora do alcance da LGPD (art. 4º, I) |
| O mesmo, em uso profissional ou institucional | Quem usa (você ou a sua organização) é o controlador e escolhe a base legal adequada (LGPD, arts. 7º e 11) |
| Enviar trechos à ferramenta de IA que você escolheu | Ação iniciada por você, nos termos da ferramenta escolhida |
| Feedback voluntário (nota, comentário, e-mail opcional e números de uso) | Consentimento (LGPD, art. 7º, I), dado a cada envio; você pode pedir a exclusão a qualquer momento |
| Dados pessoais de terceiros que você incluir na base (por exemplo, nomes em documentos) | A base legal é responsabilidade de quem inclui o conteúdo (veja os [Termos e Condições](/termos-e-condicoes)) |

Como a CriAugu não recebe nenhum desses dados, ela não atua como controladora nem como operadora do conteúdo da sua base. Ela é responsável apenas pelo próprio software e por esta política.

## 5. Seus direitos

Os seus dados estão no seu computador, então você exerce os direitos do art. 18 da LGPD diretamente:

| Direito | Como |
|---|---|
| Acesso e correção | A pasta do repositório pode ser aberta pelo sistema operacional; a tela do Tusab também permite ver e editar |
| Exclusão | Pela tela (excluir, limpar ou reset total) ou apagando os arquivos. Excluir um documento apaga também o original |
| Portabilidade | Os arquivos estão em formatos abertos (`.txt`, `.json`, `.csv`), e a base pode ser exportada num arquivo `.tusab` |
| Interromper o tratamento | Desativar ou remover o Tusab da ferramenta de IA. Com a ferramenta fechada, o Tusab não roda |

Dúvidas sobre privacidade: [tusab@tusab.solutions](mailto:tusab@tusab.solutions).

## 6. Segurança

- A tela do Tusab só responde neste computador (`127.0.0.1`) e exige uma chave nova a cada sessão.
- Os arquivos são gravados de forma que uma queda de energia não corrompa a base.
- Imagens são enviadas à IA sem metadados de localização; se a remoção não puder ser garantida, não são enviadas.
- O pacote de instalação vem com a soma SHA-256 para conferência.

Recomendamos proteger o computador com senha e criptografia de disco (BitLocker no Windows, FileVault no macOS). Mais em [Segurança](/seguranca).

## 7. Retenção

A sua base fica guardada até você apagar. A CriAugu não retém dados seus, porque não os recebe.

## 8. Crianças e adolescentes

O Tusab não é destinado a menores de 16 anos sem o acompanhamento dos responsáveis. A CriAugu não coleta dados de ninguém, inclusive de menores.

## 9. App desktop (descontinuado) {#app-desktop}

O app desktop (versões 1.0.x), descontinuado em 19/11/2026, tinha recursos que o Tusab atual não tem e que envolviam outros fluxos de dados: chat com provedores de IA configurados pelo usuário (com chaves de API guardadas no computador), telemetria anônima opcional com consentimento, e backup opcional no Google Drive. Quem ainda usa o app continua coberto pela versão 1.1 desta política, cujas regras estão resumidas em [Privacidade (detalhes técnicos)](/privacidade#app-desktop).

## 10. Alterações

Esta política pode mudar. A versão vigente fica sempre nesta página, com o número e a data da versão no topo. Mudanças relevantes também são registradas nas [Novidades](/changelog).

## 11. Contato e encarregado

**CriAugu**, CNPJ 65.131.075/0001-57
Encarregado pelo tratamento de dados: Augusto Alves Brasil
E-mail: [tusab@tusab.solutions](mailto:tusab@tusab.solutions)
