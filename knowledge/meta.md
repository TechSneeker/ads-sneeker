# Meta Ads — Conhecimento Avançado

## Atualizações Recentes do Algoritmo (2023-2024)

### Advantage+ (A+)
A Meta está empurrando fortemente para automação. As principais ferramentas:

**Advantage+ Shopping Campaigns (ASC)**
- Campanha totalmente automatizada para e-commerce
- A Meta decide público, posicionamento e otimização
- Funciona bem quando você tem 50+ compras/semana
- Combine com catálogo de produtos para melhores resultados
- Desvantagem: menos controle granular

**Advantage+ Audience**
- Substitui o público manual por sugestão da Meta
- Você define um público de sugestão, a Meta expande além dele
- Funciona melhor com pixel maduro (1.000+ eventos)
- Teste contra público manual antes de adotar completamente

**Advantage+ Placements**
- Meta escolhe onde exibir (Feed, Reels, Stories, Audience Network)
- Geralmente reduz CPM
- Pode diluir resultados se alguns posicionamentos forem ruins para seu nicho

### Tendência geral
A Meta está reduzindo o controle manual e aumentando a automação. A estratégia recomendada é:
1. Forneça bons criativos (a Meta vai distribuí-los)
2. Defina o objetivo correto (a Meta vai otimizar para ele)
3. Dê tempo para o algoritmo aprender (não mexa nos primeiros 7 dias)

---

## API de Conversões (CAPI)

### Por que é essencial
O iOS 14+ bloqueou o rastreamento via pixel em dispositivos Apple. A API de Conversões envia dados diretamente do servidor para a Meta, sem depender do navegador.

### Como implementar
**Via GTM (Google Tag Manager) — mais fácil:**
1. Instale o pixel normalmente via GTM
2. Adicione a tag de API de Conversões no GTM
3. Configure os eventos que quer rastrear

**Via servidor (mais robusto):**
1. Integre a API diretamente no backend do site
2. Envie eventos quando ocorrerem (compra, lead, etc.)
3. Use o mesmo `event_id` no pixel e na API para deduplicação

### Deduplicação
Quando você usa pixel + CAPI, o mesmo evento pode ser enviado duas vezes. Para evitar contagem dupla:
- Use o mesmo `event_id` único em ambos
- A Meta deduplica automaticamente eventos com o mesmo ID nas últimas 48h

### Verificação
- Acesse Event Manager → Visão geral dos eventos
- Verifique a coluna "Qualidade da correspondência" (deve ser acima de 6/10)
- Verifique se os eventos estão chegando via "Servidor" além de "Navegador"

---

## Estratégias de Bidding

### Menor Custo (padrão)
- Meta gasta o orçamento buscando o menor CPA possível
- Bom para: fase de aprendizado, quando você não sabe o CPA alvo
- Risco: pode gastar muito em conversões de baixa qualidade

### Limite de Custo
- Você define o CPA máximo que aceita pagar
- Meta só faz lances quando pode atingir esse custo
- Bom para: quando você tem CPA alvo definido
- Risco: pode não gastar todo o orçamento se o limite for muito baixo

### ROAS Alvo
- Você define o retorno mínimo sobre o investimento
- Bom para: e-commerce com valores de pedido variáveis
- Requer: pelo menos 50 compras/semana para funcionar bem
- Risco: pode limitar muito o volume se o ROAS alvo for muito alto

---

## Públicos — Construção e Estratégia

### Lookalike de Alta Performance
Os melhores seeds (fontes) para lookalike, em ordem de qualidade:
1. **Compradores dos últimos 180 dias** (melhor)
2. **Leads qualificados** (bom)
3. **Visitantes que adicionaram ao carrinho**
4. **Visitantes do site (últimos 30 dias)**
5. **Engajamento com página/Instagram** (mais fraco)

**Tamanho recomendado:** 1-3% para tráfego frio, 3-5% para escala

### Exclusões Essenciais
Sempre exclua de campanhas de aquisição:
- Compradores recentes (últimos 30-60 dias)
- Leads já convertidos
- Funcionários e colaboradores

### Públicos de Retargeting
- Visitantes do site (7 dias) — mais quentes
- Visitantes do site (30 dias) — mornos
- Adicionaram ao carrinho mas não compraram (30 dias)
- Engajamento com vídeo (50%+) nos últimos 60 dias
- Engajamento com página/Instagram (últimos 60 dias)

---

## Pixels — Eventos e Configuração

### Eventos Padrão Essenciais
| Evento | Quando disparar |
|--------|----------------|
| PageView | Em todas as páginas |
| ViewContent | Página de produto/serviço |
| AddToCart | Ao adicionar ao carrinho |
| InitiateCheckout | Ao iniciar checkout |
| Purchase | Ao confirmar compra |
| Lead | Ao enviar formulário |
| CompleteRegistration | Ao completar cadastro |

### Eventos Customizados
Use quando os eventos padrão não cobrem sua necessidade:
- `track('ButtonClick', {button_name: 'cta_principal'})`
- `track('VideoPlay', {video_title: 'demo'})`
- `track('ScrollDepth', {percentage: 50})`

### Verificação do Pixel
- Use o **Meta Pixel Helper** (extensão Chrome)
- Verifique no Event Manager se os eventos estão chegando
- Teste com a ferramenta "Testar eventos" no Event Manager

---

## Criativos — Melhores Práticas por Formato

### Reels/Vídeos Verticais (9:16) — Prioridade #1
- Hook nos primeiros 3 segundos (mostre o resultado ou faça uma pergunta)
- Duração ideal: 15-30 segundos
- Legendas são essenciais (70% assiste sem som)
- CTA verbal + visual no final
- Evite logotipos grandes no início

### Stories (9:16)
- Mais direto ao ponto que Reels
- Duração: 5-15 segundos
- Texto deve ser legível em tela pequena
- CTA com "Deslize para cima" ou botão

### Feed (1:1 ou 4:5)
- Imagem de alta qualidade
- Texto mínimo na imagem
- Contraste alto para chamar atenção no feed
- Formato 4:5 ocupa mais espaço no feed mobile

### Carrossel
- Primeiro card deve ser o mais forte (é o que aparece primeiro)
- Use para mostrar múltiplos produtos ou benefícios
- Cada card deve ter sentido sozinho
- Último card: CTA claro

---

## Regras Automáticas

### Para pausar anúncios com baixa performance
```
SE: Gasto > R$100 E Conversões = 0
ENTÃO: Pausar anúncio
VERIFICAR: A cada 12 horas
```

### Para escalar conjuntos vencedores
```
SE: ROAS > 3 E Gasto > R$200 E Aprendizado = Concluído
ENTÃO: Aumentar orçamento em 20%
VERIFICAR: Diariamente
```

### Para pausar por frequência alta
```
SE: Frequência > 4 E Período = 7 dias
ENTÃO: Pausar conjunto
VERIFICAR: Diariamente
```

---

## Relatórios — Métricas Essenciais

### Métricas de topo de funil
- **CPM** (Custo por 1.000 impressões) — indica competitividade do leilão
- **CTR** (Taxa de cliques) — indica qualidade do criativo
- **CPC** (Custo por clique) — CPM ÷ CTR

### Métricas de meio de funil
- **Taxa de conversão da landing page** — indica qualidade da oferta
- **Custo por lead** — para campanhas de geração de leads

### Métricas de fundo de funil
- **CPA** (Custo por aquisição) — métrica principal para conversão
- **ROAS** (Retorno sobre investimento) — para e-commerce
- **LTV** (Valor do tempo de vida do cliente) — para decisões de escala

### Colunas recomendadas no Gerenciador
Resultados, Alcance, Impressões, CPM, CTR, CPC, Valor de conversão, ROAS, Frequência, Gasto
