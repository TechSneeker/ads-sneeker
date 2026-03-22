# TikTok Ads — Conhecimento Avançado

## Por que TikTok Ads é diferente

No TikTok, **o criativo é tudo**. Diferente do Meta (onde público e estrutura importam muito) e do Google (onde palavras-chave são centrais), no TikTok um criativo excelente pode compensar uma segmentação mediana. O algoritmo distribui conteúdo baseado em engajamento, não apenas em segmentação.

Mentalidade correta: você está criando conteúdo que compete com vídeos orgânicos, não apenas anúncios.

---

## Formatos de Anúncio

### In-Feed Ads
- Aparece no feed "Para Você" como um vídeo orgânico
- Formato mais comum e acessível
- Duração: 5-60 segundos (ideal: 15-30s)
- Pode ter CTA clicável
- Parece conteúdo nativo quando bem feito

### TopView
- Primeiro anúncio que o usuário vê ao abrir o app
- Alta visibilidade, alto custo
- Ideal para lançamentos e awareness de marca
- Duração: até 60 segundos

### Brand Takeover
- Aparece imediatamente ao abrir o app (antes do feed)
- Formato de imagem ou vídeo curto (3-5 segundos)
- Exclusivo por categoria por dia (um anunciante por vez)
- Muito caro — para grandes marcas

### Spark Ads
- Impulsiona posts orgânicos existentes (seus ou de criadores)
- Mantém o engajamento original (curtidas, comentários)
- Parece 100% orgânico
- **Melhor formato para UGC (User Generated Content)**
- Requer autorização do criador do conteúdo

### Collection Ads
- Combina vídeo com catálogo de produtos
- Usuário pode navegar pelos produtos sem sair do TikTok
- Ideal para e-commerce

---

## TikTok Pixel — Implementação

### Instalação via GTM (recomendado)
1. Acesse TikTok Ads Manager → Ativos → Eventos
2. Crie um novo pixel
3. Escolha "Instalar manualmente" ou "Usar parceiro" (GTM)
4. No GTM: adicione a tag do TikTok Pixel
5. Configure os eventos que quer rastrear

### Eventos essenciais
| Evento | Quando disparar |
|--------|----------------|
| PageView | Todas as páginas |
| ViewContent | Página de produto |
| AddToCart | Ao adicionar ao carrinho |
| InitiateCheckout | Ao iniciar checkout |
| CompletePayment | Ao confirmar compra |
| SubmitForm | Ao enviar formulário |

### API de Eventos TikTok
Similar à CAPI do Meta — envia dados do servidor para o TikTok.
- Reduz impacto do bloqueio de cookies
- Melhora a qualidade dos dados de conversão
- Implementação via SDK ou integração direta

### Verificação
- Use o TikTok Pixel Helper (extensão Chrome)
- Verifique no Events Manager se os eventos estão chegando
- Teste com a ferramenta "Test Events"

---

## Públicos

### Custom Audience (Público Personalizado)
- **Visitantes do site:** baseado no pixel (últimos 7-180 dias)
- **Lista de clientes:** upload de e-mails/telefones
- **Engajamento com anúncios:** pessoas que interagiram com seus anúncios
- **Seguidores do perfil TikTok:** quem segue sua conta

### Lookalike Audience
- Baseado em qualquer Custom Audience
- Tamanho: 1-20% da população do país
- Recomendado: 1-5% para maior similaridade
- Mínimo de 1.000 pessoas no seed para criar lookalike

### Interest & Behavior Targeting
- **Interesses:** categorias amplas (Beleza, Fitness, Tecnologia, etc.)
- **Comportamentos:** ações recentes no TikTok (assistiu vídeos de X categoria)
- **Hashtags:** pessoas que interagiram com hashtags específicas
- **Criadores:** seguidores de criadores específicos

---

## Criativos — O que Funciona no TikTok

### Princípio fundamental
O anúncio deve parecer um vídeo orgânico do TikTok, não um anúncio tradicional.

### Formatos que convertem

**UGC (User Generated Content)**
- Pessoa comum falando para a câmera
- Ambiente doméstico, iluminação natural
- Tom casual e autêntico
- "Encontrei esse produto e preciso contar..."
- Funciona muito bem para produtos de consumo

**Antes e Depois**
- Mostre a transformação claramente
- Atenção: para saúde/beleza, evite claims exagerados
- Funciona para: organização, decoração, produtividade, resultados de negócio

**POV (Point of View)**
- "POV: você finalmente encontrou [solução para problema]"
- Coloca o usuário na situação
- Muito engajante

**Trend-jacking**
- Use sons e trends virais do momento
- Adapte a trend para seu produto/serviço
- Tem prazo de validade curto — use enquanto a trend está quente

**Tutorial/How-to**
- "Como eu [resultado] em [tempo]"
- Educativo + produto como solução
- Funciona bem para SaaS, cursos, ferramentas

### Estrutura de um bom criativo TikTok
1. **Hook (0-3s):** Frase ou visual que para o scroll
2. **Problema/Contexto (3-8s):** Identifica a dor ou situação
3. **Solução (8-20s):** Apresenta o produto como solução
4. **Prova (20-25s):** Resultado, depoimento, demonstração
5. **CTA (25-30s):** Ação clara ("Link na bio", "Compre agora")

### Hooks que funcionam
- "Você precisa saber disso antes de..."
- "Esse produto mudou minha rotina de..."
- "Por que ninguém fala sobre..."
- "Testei por 30 dias e..."
- Começar com o resultado final (curiosidade reversa)

---

## TikTok Creative Center

### O que é
Ferramenta gratuita da TikTok para pesquisar criativos que estão performando bem.

### Como usar para pesquisa
1. Acesse ads.tiktok.com/business/creativecenter
2. Filtre por: país, setor, objetivo, período
3. Analise os top ads: o que têm em comum?
4. Identifique hooks, formatos e estilos que funcionam no seu nicho

### O que analisar nos top ads
- Duração do vídeo
- Estilo (UGC, animação, produto, pessoa)
- Hook (como começa)
- Música/som utilizado
- CTA utilizado

---

## Bidding e Otimização

### CPM (Cost Per Mille)
- Você paga por 1.000 impressões
- Bom para: awareness, quando CTR é alto

### CPC (Cost Per Click)
- Você paga por clique
- Bom para: tráfego para site

### oCPM (Optimized CPM)
- TikTok otimiza para o evento que você definiu
- Mais comum para conversão
- Requer dados suficientes para funcionar bem

### Smart Creative
- TikTok testa automaticamente variações dos seus assets
- Combina diferentes elementos para encontrar a melhor combinação
- Bom quando você tem múltiplos assets disponíveis

### Orçamento e Lances
- Orçamento mínimo por campanha: R$50/dia
- Orçamento mínimo por grupo de anúncios: R$20/dia
- Comece com orçamento maior e reduza conforme otimiza (diferente do Meta)

---

## TikTok Shop — Integração para E-commerce

### O que é
Marketplace integrado ao TikTok onde usuários podem comprar sem sair do app.

### Como funciona
1. Crie uma conta TikTok Shop
2. Faça upload do catálogo de produtos
3. Vincule ao TikTok Ads Manager
4. Use Collection Ads ou Shopping Ads para promover produtos

### Vantagens
- Checkout dentro do TikTok (menos fricção)
- Integração com criativos (produto aparece no vídeo)
- Acesso a afiliados (criadores que promovem seus produtos)

### Afiliados TikTok
- Criadores promovem seus produtos em troca de comissão
- Você define a comissão (geralmente 5-20%)
- Conteúdo gerado pelos afiliados pode ser usado como Spark Ads
- Excelente para escalar sem aumentar o orçamento de anúncios

---

## Métricas Específicas do TikTok

| Métrica | O que indica | Referência boa |
|---------|-------------|----------------|
| VTR (View-Through Rate) | % que assistiu até o fim | > 20% |
| 2s View Rate | % que assistiu 2+ segundos | > 30% |
| CTR | % que clicou | > 0.8% |
| CPM | Custo por 1.000 impressões | < R$20 |
| CPC | Custo por clique | Varia por nicho |
| Engagement Rate | Curtidas + comentários + compartilhamentos / impressões | > 3% |
