# Aquecimento de Contas de Anúncios

## Por que o aquecimento é necessário

Plataformas de anúncios usam sistemas de machine learning para classificar contas. Uma conta nova não tem histórico de pagamento, comportamento ou qualidade de anúncios. Quando você começa a gastar muito dinheiro sem histórico, o sistema interpreta como comportamento suspeito (fraude, spam, violação de políticas).

O "trust score" de uma conta é construído ao longo do tempo com:
- Histórico de pagamentos sem chargebacks
- Anúncios aprovados e com boa performance
- Comportamento consistente (sem picos bruscos de gasto)
- Domínio verificado e pixel instalado corretamente
- Conta pessoal (no caso do Meta) com histórico real

---

## Protocolo de Aquecimento — Meta Ads (30 dias)

### Semana 1 (dias 1-7) — Fase de Confiança

**Objetivo:** Tráfego para o site
**Orçamento:** R$20-30/dia
**Configuração:**
- CBO desativado (use ABO)
- 1-2 conjuntos de anúncios
- Público: interesse amplo, 1M-5M de pessoas
- Criativo: imagem simples, copy sem gatilhos agressivos
- Sem lookalike ainda

**O que monitorar:**
- Anúncios sendo aprovados normalmente
- Gasto diário sendo consumido
- CPM abaixo de R$40
- Sem notificações de política

**Sinais de alerta:**
- Anúncios reprovados logo no início → revise o criativo
- Conta com "Revisão em andamento" → aguarde, não crie novos anúncios

### Semana 2 (dias 8-14) — Fase de Engajamento

**Objetivo:** Engajamento com publicação ou Visualizações de Vídeo
**Orçamento:** R$30-50/dia (aumento gradual de 20-30% a cada 3 dias)
**Configuração:**
- Ativar pixel em todas as campanhas
- Adicionar 1 conjunto novo com público diferente
- Começar a testar variações de criativo

**O que monitorar:**
- CTR acima de 1%
- Frequência abaixo de 2
- Pixel disparando corretamente (verificar no Event Manager)

### Semana 3 (dias 15-21) — Fase de Conversão Leve

**Objetivo:** Leads ou Conversões de baixa fricção (ViewContent, AddToCart)
**Orçamento:** R$60-100/dia
**Configuração:**
- Adicionar lookalike 1-3% sobre engajamento ou lista de clientes
- Testar copies com urgência leve
- Manter os conjuntos da semana anterior que performaram bem

**O que monitorar:**
- Custo por evento de conversão
- Taxa de aprovação de anúncios (deve estar acima de 90%)
- CPM estabilizando

### Semana 4 (dias 22-30) — Fase de Produção

**Objetivo:** Conversão completa (Purchase, Lead qualificado)
**Orçamento:** R$150-300/dia
**Configuração:**
- Ativar CBO nos conjuntos vencedores
- Escalar gradualmente (máximo 20-30% a cada 3-4 dias)
- A conta agora tem histórico suficiente para otimização real

---

## Protocolo de Aquecimento — Google Ads

### Semana 1: Campanhas de Marca
- Crie campanha de Search com palavras-chave do nome da sua empresa
- Orçamento: R$20-30/dia
- Objetivo: gerar conversões fáceis (pessoas que já conhecem a marca)
- Isso constrói histórico de qualidade rapidamente

### Semana 2: Long-tail Keywords
- Adicione palavras-chave long-tail com menor competição
- Orçamento: R$40-60/dia
- Evite Smart Bidding ainda (use CPC manual)
- Adicione negativos desde o início

### Semana 3: Expansão
- Adicione palavras-chave principais do nicho
- Orçamento: R$80-120/dia
- Comece a testar Smart Bidding apenas se tiver 30+ conversões

### Semana 4: Otimização
- Analise Search Terms Report e adicione mais negativos
- Pause palavras-chave com alto gasto e zero conversão
- Considere adicionar campanha Display para remarketing

**Regra importante:** Não ative tCPA ou tROAS antes de ter pelo menos 30 conversões no período de 30 dias. O algoritmo precisa de dados para funcionar.

---

## Protocolo de Aquecimento — TikTok Ads

### Semana 1-2: Alcance e Visualizações
- Objetivo: Alcance ou Visualizações de Vídeo
- Orçamento: R$20-40/dia
- Use vídeos curtos (7-15 segundos) — menor custo, mais dados
- Público: amplo, sem restrições demográficas excessivas

### Semana 3: Engajamento
- Objetivo: Engajamento com vídeo
- Orçamento: R$50-80/dia
- Comece a testar diferentes formatos de criativo

### Semana 4: Conversão
- Objetivo: Conversão (com pixel instalado e disparando)
- Orçamento: R$80-150/dia
- Use Smart Creative para otimização automática de criativos

---

## Sinais de que a Conta Está Pronta para Escalar

**Meta Ads:**
- CPM estável abaixo de R$25
- CTR acima de 1.5% em tráfego frio
- Taxa de aprovação de anúncios acima de 95%
- Pelo menos 50 conversões no período de otimização
- Nenhuma notificação de política nos últimos 14 dias
- Pixel com dados de pelo menos 1.000 eventos

**Google Ads:**
- Quality Score médio acima de 6/10
- Pelo menos 30 conversões nos últimos 30 dias
- Taxa de conversão estável por pelo menos 2 semanas
- CTR acima de 3% em Search

**TikTok Ads:**
- CPM abaixo de R$20
- Taxa de visualização completa acima de 20%
- Pelo menos 20 conversões no período de otimização

---

## O que Fazer se a Conta for Sinalizada Durante o Aquecimento

1. **Pare de criar novos anúncios imediatamente**
2. Leia a notificação com atenção — identifique qual política foi violada
3. Revise todos os anúncios ativos e pause os suspeitos
4. Aguarde 24-48h antes de tomar qualquer ação
5. Se for reprovação de anúncio: edite e solicite revisão manual
6. Se for restrição de conta: abra chamado no suporte com documentação da empresa
7. **Nunca crie uma nova conta no mesmo dispositivo/IP enquanto a conta atual está em revisão**

---

## Estratégias de Backup

### Conta Reserva
- Mantenha sempre uma segunda conta de anúncios no mesmo BM
- Aqueça a conta reserva com orçamento mínimo (R$10-20/dia)
- Em caso de ban da conta principal, a reserva já tem histórico

### BM Redundante
- Se você depende muito de anúncios, considere ter um segundo BM
- Use e-mail diferente, CNPJ diferente (se possível)
- Nunca use o mesmo cartão de crédito nos dois BMs

### Backup de Criativos e Públicos
- Exporte regularmente suas listas de públicos personalizados
- Salve todos os criativos e copies em pasta local
- Documente as configurações das campanhas que funcionam

---

## Como Manter uma Conta Saudável a Longo Prazo

- Nunca faça aumentos bruscos de orçamento (máximo 20-30% a cada 3-4 dias)
- Mantenha o método de pagamento sempre atualizado e com limite disponível
- Revise anúncios reprovados imediatamente — não deixe acumular
- Atualize os criativos regularmente (frequência alta = fadiga de anúncio)
- Monitore o CPM semanalmente — aumento sem motivo é sinal de problema
- Mantenha o pixel funcionando e os eventos disparando corretamente
- Verifique o domínio periodicamente (a verificação pode expirar)
