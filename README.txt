LOTERIAS+ — PACOTE CORRIGIDO PARA NETLIFY
Crédito: Desenvolvido por Paulo Cesar Neves.

ESTRUTURA DO PACOTE
- public/index.html: site
- netlify/functions/loterias.js: função intermediária para consultar a Caixa
- netlify.toml: configura publicação e rota /api/loterias/...

COMO USAR COM O GITHUB (sem instalar programas)
1. Extraia este ZIP no computador.
2. Abra o repositório https://github.com/paulonevesrhazl-arch/loterias-mais
3. Na página principal do repositório, envie os CONTEÚDOS desta pasta ZIP para a raiz do repositório: public, netlify, netlify.toml e README.txt. Não envie a pasta que contém tudo por fora.
4. Se o GitHub perguntar se deseja substituir arquivos existentes, confirme para atualizar a versão do projeto.
5. No Netlify, abra o site já criado e acesse Deploys; use Trigger deploy / Deploy site para publicar a versão atualizada do GitHub.
6. Nas configurações de build do Netlify, deixe Base directory vazio, Build command vazio, Publish directory como public e Functions directory como netlify/functions. O netlify.toml também declara essas opções.
7. Depois da publicação, teste o endereço do site e a consulta da Mega-Sena.

NOTAS IMPORTANTES
- O site pode ser publicado sem compilação; a função precisa ser implantada pelo Netlify.
- A API pública da Caixa não é uma API oficial documentada para terceiros e pode ficar indisponível, mudar ou limitar acessos. A consulta só deve ser considerada funcional depois do teste real no site publicado.
- O gerador cria combinações aleatórias e não prevê resultados nem aumenta as chances de ganhar.
- Projeto independente, não oficial da Caixa Econômica Federal.
