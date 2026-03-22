# Google Ads — Conhecimento Avançado

## Search — Estrutura e Boas Práticas

### Hierarquia ideal
```
Conta
└── Campanha (1 objetivo, 1 localização, 1 idioma)
    └── Grupo de anúncios (1 tema/intenção)
        ├── Palavras-chave (5-20 por grupo)
        └── RSA (Responsive Search Ad)
```

### Match Types (Tipos de Correspondência)

**Correspondência Exata `[palavra-chave]`**
- Só aparece para buscas muito próximas à palavra-chave
- Menor volume, maior relevância
- Use para palavras-chave de alta conversão

**Correspondência de Frase `"palavra-chave"`**
- Aparece para buscas que contêm a frase na ordem correta
- Bom equilíbrio entre volume e relevância

**Correspondência Ampla `palavra-chave`**
- Aparece para buscas relacionadas (pode ser muito amplo)
- **Nunca use sem tCPA ou tROAS** — drena orçamento
- Só funciona bem com histórico de conversões suficiente

### Negativos Essenciais (adicione desde o dia 1)
- grátis, gratuito, free
- como fazer, tutorial, passo a passo (se você vende, não ensina)
- emprego, vaga, trabalhar (se não for recrutamento)
- concorrentes (se não quiser aparecer para buscas de concorrentes)
- Revise o Search Terms Report semanalmente e adicione mais negativos

### RSA (Responsive Search Ads)
- Mínimo: 3 títulos únicos, 2 descrições
- Ideal: 10-15 títulos, 4 descrições
- Inclua a palavra-chave principal em pelo menos 1 título
- Varie os ângulos: benefício, urgência, prova social, CTA
- Fixe o título mais importante na posição 1

---

## Performance Max (PMax)

### Quando usar
- Quando você tem 30+ conversões/mês
- Quando quer alcançar todos os canais do Google (Search, Display, YouTube, Gmail, Maps)
- Para e-commerce com catálogo de produtos

### Como alimentar corretamente
**Assets obrigatórios:**
- 3-5 imagens (landscape 1.91:1 e square 1:1)
- 1-5 logos
- 1-5 vídeos (ou o Google cria automaticamente — geralmente ruim)
- 3-5 títulos curtos (30 caracteres)
- 5 títulos longos (90 caracteres)
- 5 descrições (90 caracteres)

**Dica:** Forneça vídeos próprios. Os vídeos gerados automaticamente pelo Google são de baixa qualidade.

### Exclusões importantes
- Exclua termos de marca para não canibalizar campanha de Search de marca
- Use listas de negativos de conta para excluir termos irrelevantes
- Exclua URLs específicas se não quiser que o PMax anuncie para certas páginas

### Limitações do PMax
- Pouca transparência (não mostra onde os anúncios aparecem)
- Difícil de otimizar granularmente
- Pode canibalizar outras campanhas se não configurado corretamente

---

## Display

### Segmentações disponíveis
- **Públicos de intenção personalizada:** pessoas que pesquisaram termos específicos
- **Públicos de afinidade:** pessoas com interesses relacionados
- **Remarketing:** visitantes do site, lista de clientes
- **Segmentação por tópico:** sites sobre temas específicos
- **Segmentação por posicionamento:** sites específicos onde você quer aparecer

### Formatos responsivos
- Forneça múltiplos tamanhos de imagem e o Google adapta
- Inclua imagens landscape (1.91:1) e square (1:1)
- Títulos: até 5 (30 caracteres cada)
- Descrições: até 5 (90 caracteres cada)

### Quando usar Display
- Remarketing (muito eficiente)
- Awareness de marca
- Nichos com público muito específico

---

## YouTube Ads

### Formatos principais

**TrueView In-Stream (skippable)**
- Aparece antes/durante vídeos
- Usuário pode pular após 5 segundos
- Você paga apenas se o usuário assistir 30+ segundos ou interagir
- Hook nos primeiros 5 segundos é crítico

**Bumper Ads (6 segundos)**
- Não pode ser pulado
- Ideal para awareness e reforço de mensagem
- Muito curto para conversão direta

**In-Feed (Discovery)**
- Aparece nos resultados de busca do YouTube e na página inicial
- Usuário clica para assistir
- Bom para conteúdo mais longo e educativo

### Estratégia de YouTube
1. Use TrueView para conversão (com CTA claro)
2. Use Bumper para remarketing (reforçar mensagem para quem já viu)
3. Segmente por canal, tópico ou palavras-chave de vídeo

---

## Smart Bidding

### tCPA (Target CPA)
- Você define o CPA alvo
- Google otimiza para atingir esse custo
- **Requer:** 30+ conversões nos últimos 30 dias
- Dica: defina o tCPA 20-30% acima do CPA atual para dar margem ao algoritmo

### tROAS (Target ROAS)
- Você define o retorno mínimo sobre o investimento
- Ideal para e-commerce com valores de pedido variáveis
- **Requer:** 50+ conversões nos últimos 30 dias
- Dica: comece com tROAS 20% abaixo do ROAS atual

### Maximize Conversions
- Google gasta todo o orçamento buscando o máximo de conversões
- Bom para: fase inicial quando não tem histórico suficiente para tCPA
- Risco: pode gastar muito em conversões de baixo valor

### Maximize Conversion Value
- Google prioriza conversões de maior valor
- Bom para: e-commerce com produtos de preços variados
- Requer: valores de conversão configurados corretamente

---

## Quality Score

### O que é
Nota de 1-10 que o Google dá para cada palavra-chave. Impacta diretamente o CPC e a posição do anúncio.

### Componentes
1. **CTR esperado** (peso maior) — histórico de cliques da palavra-chave
2. **Relevância do anúncio** — quão bem o anúncio corresponde à palavra-chave
3. **Experiência na página de destino** — velocidade, relevância, usabilidade

### Como melhorar
- **CTR:** Melhore os títulos dos anúncios, adicione extensões
- **Relevância:** Inclua a palavra-chave no título e na descrição do anúncio
- **Landing page:** Velocidade (use PageSpeed Insights), conteúdo relevante à busca, mobile-friendly

---

## Extensions/Assets Obrigatórias

| Extension | O que faz | Impacto |
|-----------|-----------|---------|
| Sitelinks | Links adicionais para páginas específicas | Alto |
| Callouts | Textos curtos com benefícios | Médio |
| Structured Snippets | Lista de produtos/serviços | Médio |
| Call | Número de telefone clicável | Alto (mobile) |
| Location | Endereço físico | Alto (local) |
| Price | Preços de produtos/serviços | Médio |
| Promotion | Ofertas e descontos | Alto (quando ativo) |

**Regra:** Adicione todas as extensões relevantes. Elas aumentam o CTR sem custo adicional.

---

## Google Analytics 4 (GA4) — Integração

### Por que integrar
- Importa conversões do GA4 para o Google Ads
- Permite criar públicos de remarketing baseados em comportamento
- Fornece dados de atribuição mais completos

### Configuração básica
1. Vincule GA4 ao Google Ads (em Ferramentas → Contas vinculadas)
2. Importe as conversões do GA4 para o Google Ads
3. Crie públicos no GA4 e importe para o Google Ads

### Públicos úteis para remarketing
- Visitantes que ficaram mais de 2 minutos no site
- Visitantes que viram a página de preços
- Usuários que iniciaram mas não completaram o checkout
- Usuários que converteram (para lookalike)

---

## Keywords Planner — Como Usar para Pesquisa de Mercado

### Descobrir volume de busca
1. Acesse Ferramentas → Planejador de palavras-chave
2. "Descobrir novas palavras-chave" → insira seu produto/serviço
3. Analise: volume mensal, concorrência, CPC sugerido

### Interpretar os dados
- **Volume alto + CPC alto** = mercado competitivo e lucrativo
- **Volume alto + CPC baixo** = oportunidade (pouca concorrência)
- **Volume baixo + CPC alto** = nicho específico com compradores qualificados

### Estratégia de palavras-chave
1. Comece com long-tail (menor competição, maior intenção)
2. Expanda para termos mais amplos conforme ganha histórico
3. Monitore Search Terms Report semanalmente para descobrir novas oportunidades
