LOTERIAS+ — PACOTE SIMPLES PARA CLOUDFLARE PAGES
Crédito incluído: Desenvolvido por Paulo Cesar Neves.

ESTRUTURA
- public/index.html: interface do site
- functions/api/loterias/[[path]].js: função do Cloudflare Pages que encaminha consultas à Caixa

PUBLICAÇÃO (sem instalar programas)
1. Crie um repositório no GitHub chamado loterias-mais.
2. Envie o conteúdo desta pasta para a raiz do repositório. É importante enviar tanto a pasta public quanto a pasta functions.
3. No Cloudflare, abra Workers & Pages (ou Compute > Workers & Pages) e crie uma aplicação Pages conectada ao GitHub.
4. Selecione o repositório loterias-mais.
5. Como o site já está na pasta public, configure Build command vazio (ou sem comando) e Build output directory: public.
6. Publique. O endereço será fornecido pelo Cloudflare.
7. Teste a página e o endpoint /api/loterias/megasena.

IMPORTANTE
- A integração é preparada, não testada ponta a ponta neste pacote.
- O endpoint da Caixa é público, mas não é uma API oficialmente documentada para desenvolvedores; pode bloquear, mudar ou ficar indisponível.
- Se a consulta falhar, o site mostrará um erro em vez de inventar resultados.
- O gerador usa sorteio aleatório e não prevê resultados nem melhora matematicamente as chances.
- Projeto independente; não afiliado à Caixa Econômica Federal.
