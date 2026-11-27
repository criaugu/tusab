// Testes rodam em português, qualquer que seja o idioma do sistema (CI, macOS em inglês).
// Os processos do plugin abertos pelos testes herdam esta variável.
process.env.TUSAB_IDIOMA ||= 'pt';
// Testes nunca mandam feedback ao coletor de verdade (coletor.criaugu.com): vazio = sem coletor.
process.env.TUSAB_FEEDBACK_URL ??= '';
// Nem ao Ollama da máquina de quem roda os testes: a busca por significado é testada com um Ollama falso.
process.env.TUSAB_EMBEDDINGS ??= '0';
