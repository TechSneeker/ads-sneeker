# Playbooks Práticos — Ads Agent

## Playbook 1: Lançamento de Oferta Nova (Primeiras 72h)

### Objetivo
Validar a oferta rapidamente com o menor gasto possível antes de escalar.

### Pré-lançamento (antes de ligar os anúncios)
- [ ] Landing page funcionando e carregando em menos de 3 segundos
- [ ] Pixel instalado e disparando os eventos corretos (teste com Pixel Helper)
- [ ] Método de pagamento com limite disponível
- [ ] Criativos aprovados (faça upload e aguarde aprovação antes de ativar)
- [ ] UTMs configurados para rastrear a fonte

### Estrutura de teste (primeiras 72h)
- 1 campanha ABO (não CBO ainda)
- 3 conjuntos de anúncios com públicos diferentes:
  - Conjunto 1: Interesse amplo (1M-5M)
  - Conjunto 2: Lookalike 1% (se tiver dados)
  - Conjunto 3: Retargeting (visitantes 30 dias)
- 3 criativos por conjunto (teste de ângulo)
- Orçamento: R$50-100/dia por conjunto

### O que analisar nas primeiras 72h
- **CTR acima de 1%?** → Criativo está chamando atenção
- **Taxa de conversão da landing page acima de 2%?** → Oferta está ressoando
- **CPA dentro do aceitável?** → Escalar
- **CPA muito alto?** → Problema na oferta ou no público

### Decisão após 72h
- Se 1+ conjunto com CPA aceitável → escale esse conjunto, pause os outros
- Se nenhum conjunto funcionou → revise a oferta antes de continuar gastando

---

## Playbook 2: O que Fazer Quando os Resultados Caem de Repente

### Diagnóstico rápido (em ordem de probabilidade)

**1. Verifique o pixel primeiro**
- Acesse Event Manager → verifique se os eventos estão disparando
- Se o pixel parou de funcionar, o algoritmo perdeu os dados de otimização

**2. Verifique a landing page**
- A página está no ar? Carregando rápido?
- Alguma mudança foi feita recentemente?

**3. Verifique a frequência**
- Frequência acima de 3.5 em público frio = público saturado
- Solução: novos criativos ou novos públicos

**4. Verifique o CPM**
- CPM subiu muito? Pode ser sazonalidade (datas comemorativas encarecem o leilão)
- Ou pode ser que seus anúncios perderam relevância

**5. Verifique se há anúncios reprovados**
- Anúncios reprovados reduzem o alcance de toda a campanha

**6. Verifique mudanças externas**
- Concorrente novo no mercado?
- Mudança de sazonalidade?
- Problema com o produto/serviço?

### Ações corretivas

| Problema | Solução |
|----------|---------|
| Pixel parou | Reinstale e aguarde 24-48h para o algoritmo se recalibrar |
| Landing page lenta | Otimize velocidade (PageSpeed Insights) |
| Frequência alta | Novos criativos + expansão de público |
| CPM alto por sazonalidade | Reduza orçamento temporariamente ou aguarde |
| Anúncios reprovados | Edite e solicite revisão |
| Público saturado | Lookalike novo ou interesse diferente |

---

## Playbook 3: Escalar de R$500/dia para R$2.000/dia

### Pré-requisitos antes de escalar
- CPA estável por pelo menos 5 dias consecutivos
- Pelo menos 50 conversões no período de otimização
- Aprendizado concluído (sem ícone ⚠️ nos conjuntos)
- Pixel com dados suficientes

### Semana 1: Escala Vertical (R$500 → R$800)
- Aumente o orçamento dos conjuntos vencedores em 20-30%
- Aguarde 3-4 dias antes do próximo aumento
- Monitore o CPA diariamente

### Semana 2: Escala Horizontal (R$800 → R$1.200)
- Duplique os 2-3 melhores conjuntos com públicos ligeiramente diferentes
- Mantenha os originais rodando — não pause o que está funcionando
- Teste novos criativos (o volume maior vai saturar os atuais mais rápido)

### Semana 3-4: Consolidação (R$1.200 → R$2.000)
- Ative CBO nos conjuntos vencedores
- Continue aumentando 20-30% a cada 3-4 dias
- Expanda para novos públicos (lookalike 2-5%, novos interesses)

### Regras de ouro da escala
- **Nunca dobre o orçamento de uma vez** — reinicia o aprendizado
- **Nunca edite um conjunto em aprendizado** — aguarde o aprendizado concluir
- **Mantenha sempre 3-5 criativos novos em teste** — a escala consome criativos rápido
- **Monitore o ROAS diariamente** — se cair abaixo do mínimo aceitável, reduza

---

## Playbook 4: Recuperar Conta Após Período Inativo

### Situação: conta ficou parada por 30+ dias

**Problema:** O algoritmo "esquece" os dados de otimização. Retomar com orçamento alto é como começar do zero.

**Protocolo de reativação:**
1. Semana 1: Reative com 30-40% do orçamento anterior
2. Use objetivo de tráfego ou engajamento primeiro
3. Verifique se o pixel ainda está funcionando
4. Atualize os criativos (os antigos podem estar desatualizados)
5. Semana 2: Volte para objetivo de conversão
6. Semana 3: Retome o orçamento original gradualmente

---

## Playbook 5: Migrar de Uma Conta para Outra Sem Perder Histórico

### Quando isso é necessário
- Conta banida e você tem uma conta reserva
- Mudança de estrutura de BM
- Transferência para conta de agência

### O que você PODE transferir
- Públicos personalizados (exporte e importe)
- Criativos (salve localmente e faça upload na nova conta)
- Copies e configurações (documente tudo)
- Pixel (pode ser compartilhado entre contas no mesmo BM)

### O que você NÃO pode transferir
- Histórico de conversões (fica na conta antiga)
- Aprendizado do algoritmo (começa do zero)
- Score de qualidade dos anúncios

### Protocolo de migração
1. Exporte todos os públicos personalizados da conta antiga
2. Salve todos os criativos e copies
3. Documente as configurações das campanhas que funcionavam
4. Na nova conta: comece com aquecimento (não pule essa etapa)
5. Recrie as campanhas gradualmente, não tudo de uma vez

---

## Playbook 6: Estrutura de Testes A/B Eficiente

### Regra fundamental
**Teste uma variável por vez.** Se você mudar público E criativo ao mesmo tempo, não sabe o que causou a diferença.

### O que testar (em ordem de impacto)
1. **Hook/Imagem principal** — maior impacto no CTR
2. **Oferta** — maior impacto na conversão
3. **Público** — impacto no custo e volume
4. **CTA** — impacto menor, mas vale testar
5. **Formato** — vídeo vs imagem vs carrossel

### Estrutura de teste
- Mínimo R$50 por variação antes de tirar conclusões
- Mínimo 3-5 dias de dados
- Mínimo 100 cliques por variação para dados estatisticamente relevantes
- Use a mesma janela de atribuição para comparar

### Como declarar um vencedor
- CPA 20%+ menor que a variação de controle
- Dados de pelo menos 3-5 dias
- Pelo menos 10 conversões na variação vencedora

---

## Playbook 7: Onboarding de Novo Cliente (Agência)

### Semana 1: Auditoria e Acesso
- [ ] Acesso ao BM do cliente (como parceiro, não como admin)
- [ ] Acesso ao Google Analytics / GA4
- [ ] Acesso ao site (para verificar pixel e velocidade)
- [ ] Histórico de campanhas anteriores (o que funcionou, o que não funcionou)
- [ ] Briefing: produto, público-alvo, ticket médio, CPA máximo aceitável

### Semana 2: Diagnóstico
- Audite as campanhas existentes (estrutura, públicos, criativos, configurações)
- Verifique o pixel (está disparando todos os eventos necessários?)
- Analise o histórico de performance (últimos 90 dias)
- Identifique os maiores problemas e oportunidades

### Semana 3: Implementação
- Corrija os problemas críticos primeiro (pixel, estrutura, públicos)
- Não mude tudo de uma vez — priorize o que tem maior impacto
- Documente todas as mudanças feitas

### Semana 4: Otimização
- Analise os resultados das mudanças
- Apresente relatório ao cliente com métricas claras
- Defina metas para o próximo mês

### Métricas para reportar ao cliente
- CPA (Custo por Aquisição)
- ROAS (Retorno sobre Investimento em Anúncios)
- CPL (Custo por Lead) — se aplicável
- CTR (Taxa de Cliques)
- Taxa de conversão da landing page
- Investimento total vs resultado gerado
