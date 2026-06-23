# Status do Backend — IBNCV Cristo Vive

**Atualizado: 22/jun/2026**

## ✅ Fase 1 — Backend criado e testado (LIVE)
- **Projeto Supabase:** `ibncv-cristo-vive` (id `uldssazirjhkbptankcq`) — região Brasil (São Paulo), plano grátis.
- **Tabelas criadas** (com RLS/segurança):
  - `pessoas` — membros, visitantes, novos convertidos (CRM)
  - `acolhimento_steps` — definição das trilhas de acolhimento (12 passos semeados)
  - `acolhimento_envios` — fila de mensagens agendadas (gerada automaticamente)
  - `pedidos_oracao` + `oracao_intercessoes` — oração + "Estou orando" + mural
  - `eventos` — agenda de cultos (4 eventos semeados)
- **Automação do acolhimento:** ✅ testada — ao cadastrar um visitante, o sistema
  enfileira sozinho as 6 mensagens nos dias certos (0,1,3,5,7,14). Funciona!

## ✅ Disparador do acolhimento — CRIADO (falta só ativar o Brevo)
- Função edge **send-acolhimento** (envia a fila por e-mail via Brevo, template IBNCV).
- **Cron a cada 30 min** (ativo) processa a fila automaticamente.
- Cofre **app_secrets** criado (guard `acolhe_secret` + placeholders do Brevo).
- ⚠️ **Para ATIVAR o envio:** preencher no cofre `brevo_api_key` e `brevo_sender_email`
  (William cria/verifica um remetente no Brevo e passa a chave). Enquanto não, o
  sistema fica pronto e em espera (não envia, não dá erro).

## ✅ Fase 2 — Frontend do app CONSTRUÍDO (23/jun)
App real em Expo Router + react-native-web (mesma stack do Amara), na raiz da pasta.
Todas as telas compilam (esbuild 9/9 OK) e estão ligadas ao banco live:
- **Início** (`app/(tabs)/index.tsx`) — Home premium: banner, versículo do dia,
  atalhos, próximo culto, carrossel de encontros, edificação, CTA de acolhida.
- **Acolhida** (`cadastro.tsx`) — grava em `pessoas` → dispara acolhimento automático.
- **Oração** (`oracao.tsx`) — pedido em `pedidos_oracao` + mural + "Estou orando".
- **Agenda** (`agenda.tsx`) — lê `eventos` (ativo=true).
- **Mais** (`mais.tsx`) — quem somos / ministérios / contribuição / onde estamos.
- Identidade em `constants/theme.ts`; cliente em `services/supabase.ts`.
- RLS conferida: anônimo pode cadastrar, pedir oração e ver mural/agenda. ✔
- Guia de publicação em `DEPLOY.md`.

## 🔜 Próximos passos
1. **Imagens:** subir as 8 no Bunny `ibncv/` (William em andamento).
2. **Deploy:** repo novo no GitHub + Vercel (env vars no `DEPLOY.md`).
3. **Push:** VAPID + service worker quando o app estiver no ar.
4. **Painel da equipe:** ver visitantes novos e pedidos de oração.
5. **Brevo:** preencher `brevo_api_key`/`brevo_sender_email` pra ativar e-mails.

## Pendências do Pastor
- Logo IBNCV (PNG transparente) → `design/`
- Ajustar/aprovar os textos das trilhas em `ACOLHIMENTO-SEQUENCIA.md`
