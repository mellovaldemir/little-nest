# ARROW — Loja + Painel Admin

Site da loja **ARROW Baby Accessories** (em inglês, para clientes dos EUA) + **painel de administração** em `/admin`.
Tudo grátis: site estático + funções da Vercel (pasta `api/`) + banco de dados gratuito Upstash Redis.

## O que tem aqui

| Página | Arquivo |
|---|---|
| Página inicial (carrossel, mais vendidos, kit, categorias, novidades, avaliações) | `index.html` |
| Loja com filtros e ordenação | `shop.html` |
| Página de produto (uma só para todos: `product.html?id=...`) | `product.html` |
| Carrinho com cupom + PayPal | `cart.html` |
| Ajuda e políticas (frete, trocas, privacidade, termos, FAQ) | `policies.html` |
| Sobre nós + Contato | `about.html` |
| **Painel admin** | `admin/` → abra `/admin` |

Os produtos, banners, cupons e pedidos ficam no banco de dados (não no HTML). Você muda tudo pelo painel.

---

## Passo 1 — Subir os arquivos para o GitHub

O jeito mais fácil, sem programas, direto no navegador:

1. Descompacte o arquivo `arrow-store.zip` no seu computador.
2. Entre em https://github.com e abra o repositório que já está ligado à Vercel (`mellovaldemir/little-nest`).
   *(Se preferir um repositório novo: clique em **New**, dê o nome `arrow-store`, crie, e depois importe ele na Vercel em **Add New → Project**.)*
3. Clique em **Add file → Upload files**.
4. Abra a pasta descompactada, **selecione tudo que está dentro dela** (não a pasta em si) e arraste para a página do GitHub.
   Pastas como `api`, `admin`, `css`, `img` vão junto.
5. Embaixo, clique em **Commit changes**.
6. A Vercel publica sozinha em 1 ou 2 minutos.

> Os arquivos antigos (`shipping.html`, `returns.html` etc.) foram trocados por redirecionamentos para as páginas novas, então links antigos continuam funcionando.

## Passo 2 — Criar o banco de dados grátis (Upstash Redis)

Sem o banco, a loja abre, mas o painel **não consegue salvar** nada na Vercel.

1. Entre em https://vercel.com e abra o projeto da loja.
2. Clique na aba **Storage**.
3. Clique em **Create Database** (ou **Browse Marketplace**) e escolha **Upstash → Upstash for Redis**.
4. Escolha o plano **Free**, uma região nos EUA (ex.: `Washington, D.C., USA (iad1)`) e confirme.
5. Quando perguntar, **conecte (Connect) o banco ao projeto da loja**.
6. Pronto: a Vercel cria sozinha as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.

*Alternativa:* criar a conta em https://upstash.com → **Create Database** (Redis, Free) → copie **UPSTASH_REDIS_REST_URL** e **UPSTASH_REDIS_REST_TOKEN** e adicione na Vercel (Passo 3). O código aceita os dois nomes.

Na primeira vez que o site abrir, os produtos atuais, os banners e os cupons `WELCOME10` e `BUNDLE15` são colocados no banco automaticamente.

## Passo 3 — Colocar a senha do painel (variáveis de ambiente)

Na Vercel: **Projeto → Settings → Environment Variables → Add**:

| Nome | Valor | Obrigatório? |
|---|---|---|
| `ADMIN_PASSWORD` | a senha do painel (use uma senha forte, com 12 ou mais caracteres) | **Sim** |
| `KV_REST_API_URL` | criada sozinha no Passo 2 | **Sim** |
| `KV_REST_API_TOKEN` | criada sozinha no Passo 2 | **Sim** |
| `ADMIN_SECRET` | qualquer texto longo e aleatório (deixa o login mais seguro) | Opcional |
| `CJ_API_KEY` | chave da API da CJ (para quando a integração real for feita) | Mais tarde |

Depois de salvar as variáveis: **Deployments → … (três pontinhos) no último → Redeploy**.
(A Vercel só lê variáveis novas depois de publicar de novo.)

## Passo 4 — Entrar no painel

1. Abra `https://SEU-SITE.vercel.app/admin` (ex.: `https://little-nest-olive.vercel.app/admin`).
2. Digite a senha do `ADMIN_PASSWORD`.
3. Você fica logado por 7 dias neste navegador. Para sair, clique em **Log out**.

### O que dá para fazer no painel
- **Dashboard**: vendas do mês, faturamento, lucro estimado (total − frete − custo do produto), pedidos por status, mensagens e inscritos da newsletter.
- **Products**: adicionar, editar, apagar, trocar fotos (upload ou link), preço, preço "de" (mostra *Sale*), custo da CJ, link e SKU da CJ, ativar/esconder.
- **Orders**: os pedidos aparecem sozinhos quando o cliente paga no PayPal. Mude o status (New → Sent to CJ → Shipped → Delivered) e coloque o rastreio.
- **Send to CJ**: botão em cada pedido novo. **Nunca envia sozinho**: abre uma confirmação, você marca a caixinha e confirma.
- **Banners**: textos e imagens do carrossel e a faixa de aviso do topo.
- **Coupons**: criar ou apagar cupons (% ou valor fixo, com pedido mínimo opcional).

---

## Testar no seu computador (opcional)

Precisa do Node.js 18 ou mais novo (https://nodejs.org).

```bash
# dentro da pasta do projeto
ADMIN_PASSWORD=minhasenha node dev-server.js
# abra http://localhost:3000  e  http://localhost:3000/admin
```
No Windows (PowerShell): `$env:ADMIN_PASSWORD="minhasenha"; node dev-server.js`

Sem as variáveis do banco, os dados ficam salvos em `data/db.local.json`. Apague esse arquivo para voltar ao início.

## O que ainda é teste ou exemplo (trocar antes de vender de verdade)

1. **PayPal em modo teste** (`client-id=sb` em `cart.html`). Troque `sb` pelo seu *Client ID* **Live** do PayPal Developer.
2. **CJ ainda é simulado**: `api/create-cj-order.js` não chama a CJ de verdade; só marca o pedido como "Sent to CJ" com um número `MOCK-...`.
3. **Verificação do pagamento no servidor**: antes de vender de verdade, o servidor precisa confirmar o pagamento com a API do PayPal (anotado como TODO em `api/orders.js`).
4. **Produtos de exemplo** (marcados "Example", sem foto): troque foto, texto, preço e custo pelos itens reais da CJ, ou apague.
5. **Avaliações da página inicial são exemplos** (placeholders): troque por avaliações reais ou remova. Nos EUA não é permitido mostrar avaliações inventadas.
6. **E-mail `hello@arrowbaby.com`** é exemplo: troque em **Banners → Contact email**.
7. **Textos das políticas** são modelos: revise em `policies.html`.
8. Pedido **AR-SAMPLE1** é um pedido de exemplo para você ver o painel; pode apagar.

## Estrutura técnica
- `api/_lib/storage.js`: banco (Upstash Redis via REST; sem variáveis → arquivo local).
- `api/_lib/auth.js`: login com senha do `ADMIN_PASSWORD` + cookie assinado (HMAC, HttpOnly).
- `api/products.js`, `settings.js`, `coupons.js`, `orders.js`, `image.js`, `contact.js`, `auth.js`, `create-cj-order.js`: 8 funções (o plano grátis da Vercel permite até 12).
- `api/_lib/seed.json`: dados iniciais. `data/products.json` / `data/settings.json`: cópia usada pela loja se a API cair.
- Fontes: Fredoka e Nunito (Google Fonts, licença OFL), salvas em `fonts/`.
