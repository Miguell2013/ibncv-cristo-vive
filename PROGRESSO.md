# 📌 IBNCV Cristo Vive — Onde paramos (23/jun/2026)

App no ar: **https://ibncv-cristo-vive.vercel.app**
(Sempre abrir com `?v=N` mudando o número pra furar cache do celular.)

## Como publicar mudanças (deploy)
```powershell
robocopy "$HOME\Documents\amara-kiala-stream\IBNCV-Cristo-Vive" "$HOME\Documents\ibncv-cristo-vive" /E /IS /IT /XD .git /XF .env
cd "$HOME\Documents\ibncv-cristo-vive"
git add .
git commit -m "mensagem"
git push
```
> Use sempre `/IS /IT` (foi o que fez a cópia pegar). Depois abra com `?v=N`.

## Acessos / códigos
- **PIN geral do painel (pastor):** `111111` (trocar depois em Supabase → app_secrets → painel_pin, ou me pedir).
- **PIN de cada departamento (líder):** ver no app → Mais → Painel da Equipe → entrar com 111111 → aba **Acessos**.
- Supabase (igreja): projeto `ibncv-cristo-vive` (id `uldssazirjhkbptankcq`).
- Imagens: Bunny, pull zone `ibncv.b-cdn.net` (lembrar que renomear duplica `.png` — digitar nome sem extensão).

## ✅ O que já está PRONTO e no ar
- **Visual premium** (Home, Acolhimento, Oração, Agenda, Mais) com logo, foto do pastor, fundo escuro, cards flutuando.
- **Acolhimento em 2 passos:** escolhe "como chega" (visitando / aceitei Jesus / membro) → abre o formulário daquela jornada → grava no CRM e dispara a trilha de acolhimento.
- **Cadastro de membro** (sem senha, lembrado no aparelho) + **Perfil** (completar dados) + **Meus Pedidos**.
- **Direcionamento automático ao departamento** por idade+sexo (0–11 Infantil, 12–17 Adolescentes, 18–29 Jovens, 30–59 Homens/Mulheres, 60+ Melhor Idade).
- **Painel da Equipe (PIN):**
  - Pastor (PIN geral): **Relatório** (números + membros por departamento), **Pedidos** (marcar respondido), **Acessos** (PINs dos líderes).
  - Líder (PIN do depto): vê só os **membros do seu departamento**.
- **6 Departamentos** criados + **Grupos de Comunhão** (tabela pronta, ainda sem grupos cadastrados).
- Correção importante: o gatilho de acolhimento estava bloqueando todos os cadastros — **resolvido**.

## 🔜 Próximas etapas (quando voltar)
1. **Frente 3 — Automação de notificações** (como no Amara):
   - Mensagem do dia (palavra) · informativos de programação · agradecimento a quem contribuiu.
   - Precisa: chaves VAPID (push) + agendamento (cron) + conteúdo. (Brevo p/ e-mail: falta `brevo_api_key` no cofre.)
2. **Lado do membro — Grupos de Comunhão e Departamentos:** o membro vê/participa do grupo e dos departamentos.
3. **Gestão no painel:** cadastrar/editar Grupos de Comunhão (nome, líder, dia, local).
4. **Deixar os PINs dos departamentos mais fáceis** (se quiser).
5. **App nativo** (Play Store / App Store) + push, quando decidir.

## Observações
- App **gratuito** para membros (sem pagamento).
- Login é por **identificação leve** (nome + WhatsApp), sem senha; perfil completa depois.
