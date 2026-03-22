# Rastreamento e Atribuição

## Visão Geral da Stack de Rastreamento

Uma stack completa para tráfego pago tem três camadas:
1. Tag no navegador (pixel/gtag) — captura comportamento do usuário no site
2. API server-side (CAPI/Enhanced Conversions) — envia dados do servidor, independente do navegador
3. Analytics (GA4) — visão unificada de todas as fontes

As três camadas se complementam. Depender só do pixel é insuficiente desde o iOS 14.

---

## Meta Pixel + CAPI

### Por que o pixel sozinho não basta
- iOS 14+ bloqueia rastreamento em dispositivos Apple por padrão
- Bloqueadores de anúncio (uBlock, AdBlock) bloqueiam o pixel
- Resultado: Meta vê menos conversões do que realmente aconteceram → algoritmo otimiza mal

### Implementação do Pixel via GTM
1. Acesse Events Manager no Meta Business Suite
2. Crie um novo pixel → copie o Pixel ID
3. No GTM: Nova tag → tipo "Meta Pixel"
4. Cole o Pixel ID
5. Gatilho: All Pages
6. Publique o container

### Eventos essenciais e quando disparar

| Evento | Gatilho |
|--------|---------|
| PageView | Todas as páginas (automático com o pixel base) |
| ViewContent | Página de produto ou serviço |
| AddToCart | Clique no botão "Adicionar ao carrinho" |
| InitiateCheckout | Entrada na página de checkout |
| AddPaymentInfo | Preenchimento de dados de pagamento |
| Purchase | Página de confirmação de compra |
| Lead | Envio de formulário |
| CompleteRegistration | Conclusão de cadastro |

### Parâmetros importantes no Purchase
```javascript
fbq('track', 'Purchase', {
  value: 97.00,        // valor da compra
  currency: 'BRL',     // moeda
  content_ids: ['123'], // ID do produto
  content_type: 'product'
});
```

### API de Conversões (CAPI) — implementação

**Via GTM (mais fácil):**
1. No GTM, adicione a tag "Conversions API via GTM" (template oficial da Meta)
2. Configure com o mesmo Pixel ID e um Access Token (gerado no Events Manager)
3. Use o mesmo `event_id` no pixel e na CAPI para deduplicação

**Via servidor (mais robusto):**
```
POST https://graph.facebook.com/v18.0/{pixel_id}/events
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1234567890,
    "event_id": "uuid-unico",
    "user_data": {
      "em": ["hash_do_email"],
      "ph": ["hash_do_telefone"]
    },
    "custom_data": {
      "value": 97.00,
      "currency": "BRL"
    }
  }]
}
```

### Deduplicação
Quando pixel + CAPI enviam o mesmo evento, a Meta pode contar duas vezes.
- Gere um `event_id` único por evento (UUID ou timestamp + user_id)
- Envie o mesmo `event_id` no pixel e na CAPI
- A Meta deduplica automaticamente eventos com mesmo ID nas últimas 48h

### Qualidade da correspondência (EMQ)
Acesse Events Manager → coluna "Qualidade da correspondência"
- 6-10: excelente — Meta consegue identificar o usuário
- 4-6: médio — envie mais dados (e-mail, telefone, nome)
- 0-4: ruim — o algoritmo não consegue otimizar bem

Para melhorar: envie e-mail, telefone, nome, cidade, estado, CEP (todos hasheados em SHA-256)

---

## Google Tag (gtag.js) + Enhanced Conversions

### Implementação via GTM
1. Crie uma tag Google Ads Conversion Tracking no GTM
2. Use o Conversion ID e Conversion Label do Google Ads
3. Gatilho: página de confirmação (thank you page)
4. Publique

### Enhanced Conversions
Envia dados do usuário hasheados para melhorar a atribuição (similar à CAPI).

**Via GTM:**
1. Ative Enhanced Conversions nas configurações de conversão do Google Ads
2. No GTM, configure a variável de dados do usuário (e-mail, nome, telefone)
3. A tag de conversão envia automaticamente os dados hasheados

**Dados que melhoram a atribuição:**
- E-mail (maior impacto)
- Número de telefone
- Nome completo
- Endereço

### Importar conversões do GA4 para o Google Ads
1. Vincule GA4 ao Google Ads (Ferramentas → Contas vinculadas)
2. No GA4: Administrador → Eventos → marque como conversão
3. No Google Ads: Ferramentas → Conversões → Importar do GA4
4. Use as conversões importadas como meta de otimização

---

## TikTok Pixel + Events API

### Implementação via GTM
1. TikTok Ads Manager → Ativos → Eventos → Criar pixel
2. Escolha "Instalar manualmente" → copie o código
3. No GTM: Nova tag → HTML personalizado → cole o código
4. Gatilho: All Pages
5. Configure eventos adicionais com tags separadas

### Events API (server-side)
Similar à CAPI do Meta. Envie eventos do servidor para reduzir perda de dados.

```
POST https://business-api.tiktok.com/open_api/v1.3/event/track/
{
  "pixel_code": "SEU_PIXEL_ID",
  "event": "CompletePayment",
  "timestamp": "2024-01-01T00:00:00+00:00",
  "context": {
    "user": {
      "email": "hash_sha256_do_email"
    }
  },
  "properties": {
    "value": 97.00,
    "currency": "BRL"
  }
}
```

---

## UTMs — Estrutura e Padrão

### Por que UTMs são essenciais
Sem UTMs, o GA4 não sabe de qual campanha, conjunto ou anúncio veio a conversão. Você perde a capacidade de otimizar por fonte.

### Parâmetros UTM

| Parâmetro | O que é | Exemplo |
|-----------|---------|---------|
| utm_source | Plataforma de origem | meta, google, tiktok |
| utm_medium | Tipo de mídia | cpc, paid_social |
| utm_campaign | Nome da campanha | black_friday_2024 |
| utm_content | Identificador do criativo | video_ugc_01 |
| utm_term | Palavra-chave (Google) | emprestimo_consignado |

### Padrão recomendado por plataforma

**Meta Ads (use parâmetros dinâmicos):**
```
utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

**Google Ads (use ValueTrack):**
```
utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_term={keyword}&utm_content={creative}
```

**TikTok Ads:**
```
utm_source=tiktok&utm_medium=paid_social&utm_campaign=__CAMPAIGN_NAME__&utm_content=__CREATIVE_ID__
```

### Onde adicionar UTMs
- Meta: nível do anúncio → URL do site → parâmetros de URL
- Google: nível da campanha → configurações → parâmetros de URL finais
- TikTok: nível do anúncio → URL de destino

---

## GA4 — Configuração para Tráfego Pago

### Eventos essenciais para configurar
- `purchase` — com parâmetros value e currency
- `generate_lead` — envio de formulário
- `begin_checkout` — início do checkout
- `add_to_cart` — adição ao carrinho

### Relatórios úteis para gestão de tráfego

**Aquisição → Aquisição de tráfego:**
- Veja sessões e conversões por fonte/mídia
- Filtre por utm_source para ver cada plataforma

**Engajamento → Páginas e telas:**
- Identifique páginas com alta taxa de saída
- Encontre gargalos no funil

**Monetização → Visão geral:**
- Receita por fonte
- Produtos mais vendidos

### Funil de conversão no GA4
1. Explorar → Funil de exploração
2. Adicione as etapas: PageView → ViewContent → AddToCart → Purchase
3. Identifique onde os usuários abandonam
4. Segmente por fonte para ver qual plataforma tem melhor funil

---

## Atribuição — Modelos e Impacto

### Modelos de atribuição

**Last Click (padrão do Google Ads):**
- 100% do crédito para o último clique antes da conversão
- Subestima canais de topo de funil (Meta, TikTok)
- Problema: usuário viu anúncio no TikTok, pesquisou no Google, converteu → Google leva todo o crédito

**Data-Driven (recomendado):**
- Distribui crédito baseado em dados reais de conversão
- Mais preciso, mas requer volume mínimo de conversões
- Disponível no Google Ads e GA4

**Linear:**
- Distribui crédito igualmente entre todos os touchpoints
- Mais justo para avaliar canais de awareness

### Janela de atribuição
- Meta: padrão é 7 dias após clique + 1 dia após visualização
- Google: padrão é 30 dias após clique
- TikTok: padrão é 7 dias após clique

**Importante:** Use a mesma janela de atribuição ao comparar plataformas. Janelas diferentes inflam ou deflam os números de cada canal.

### Problema da dupla contagem
Quando Meta e Google rodam ao mesmo tempo, ambos podem atribuir a mesma conversão para si.
- Meta diz: "eu converti 50 pessoas"
- Google diz: "eu converti 40 pessoas"
- GA4 diz: "foram 60 conversões no total"

Solução: use o GA4 como fonte de verdade para o total. Use as plataformas para otimização interna.

---

## Checklist de Rastreamento

Antes de ligar qualquer campanha:
- Pixel/tag instalado e disparando PageView em todas as páginas?
- Evento de conversão principal configurado e testado?
- CAPI/Enhanced Conversions ativo?
- UTMs configurados em todos os anúncios?
- GA4 recebendo eventos com parâmetros corretos?
- Conversões importadas no Google Ads (se usar GA4)?
- Deduplicação configurada (mesmo event_id no pixel e na API)?
- Qualidade da correspondência acima de 6 no Meta?
