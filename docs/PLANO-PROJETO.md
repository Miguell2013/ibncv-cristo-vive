# Plano do Projeto — App IBNCV Cristo Vive

## Visão
App oficial da igreja com o coração na **gestão de pessoas + acolhimento automático** de visitantes e novos convertidos, além das funções clássicas (conteúdo, agenda, oração, ao vivo, doações).

## Fases

### Fase 1 — O coração (CRM + Acolhimento) ⭐ começar por aqui
- Cadastro de **membros, visitantes e novos convertidos** (ficha completa)
- Tela de **Acolhimento** ("Quero ser acolhido")
- **Acolhimento automático:** ao se cadastrar como visitante/novo convertido, entra numa sequência de mensagens (push + e-mail) nos dias seguintes
- **Pedidos de oração** (com áreas + status + mural)
- **Avisos de cultos/eventos** (push)
- **Painel da equipe:** ver visitantes novos, pedidos de oração, acompanhar acolhimento

### Fase 2 — Conteúdo e presença
- Conteúdo (pregações, séries, devocionais/planos de leitura)
- Agenda completa de cultos/eventos com lembretes
- Ao Vivo (transmissões)

### Fase 3 — Comunidade e recursos
- Doações/dízimo online
- Bíblia
- Minha Célula
- Testemunhos
- Refinos visuais

## WhatsApp (importante)
- Começo: acolhimento por **push + e-mail** (grátis)
- Depois: **WhatsApp Business API oficial** (Meta) — custo por mensagem, sem risco de banir o número. (Robôs não-oficiais = proibidos, não usar.)

## Stack
- **GitHub** (repositório novo, separado da Amara)
- **Vercel** (hospedagem + PWA + domínio) — *fazer verificação de e-mail do domínio na hora!*
- **Supabase** (banco, login, automação via edge functions + cron)
- **Brevo** (e-mail) · **Web Push** (notificações)
- **Expo / React Native** (web → depois Android na Play Store)
- Reaproveita base do app da Amara (login, push, banco, componentes)

## Custos (resumo)
- Construção + design: R$ 0 (trabalho aqui)
- Hospedagem: grátis no início
- Domínio: ~R$ 40/ano (opcional)
- Play Store: ~US$ 25 (taxa única, quando publicar)
- WhatsApp oficial: por mensagem (fase posterior)
