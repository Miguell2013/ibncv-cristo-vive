# 🚀 Como colocar o app IBNCV no ar

O app já está pronto (mesma stack do Amara: Expo Router + react-native-web).
Faltam só os passos que dependem das suas contas (GitHub, Vercel, Bunny).

## 1. Imagens no Bunny (pasta `ibncv/`)
Suba com estes nomes exatos (minúsculo, sem espaço):
`logo.png`, `banner-home.png`, `ev-celebracao.png`, `ev-oracao.png`,
`ev-jovens.png`, `ev-conferencia.png`, `edif-1.png`, `edif-2.png`.
> O app puxa de `https://amara-kiala.b-cdn.net/ibncv/<nome>`.

## 2. Repositório no GitHub
Crie um repositório novo (ex.: `ibncv-cristo-vive`) e suba esta pasta.
Não suba o arquivo `.env` (já está no `.gitignore`).

## 3. Projeto na Vercel
- Importe o repositório.
- **Build Command:** `npx expo export --platform web`
- **Output Directory:** `dist`
- **Variáveis de ambiente** (Settings → Environment Variables):
  - `EXPO_PUBLIC_SUPABASE_URL` = `https://uldssazirjhkbptankcq.supabase.co`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = a chave publishable (a mesma do `.env`)
  - `EXPO_PUBLIC_CDN_BASE` = `https://amara-kiala.b-cdn.net/ibncv`

## 4. Logo/ícone do app
Troque os placeholders em `assets/branding/` (`icon-app.png`, `splash.png`)
pela logo real quando tiver. (O app funciona com os placeholders.)

---

## O que já está pronto e ligado ao banco (live)
- **Início** — Home premium (banner, versículo do dia, atalhos, encontros, edificação).
- **Acolhida** — cadastro de visitante/novo convertido/membro → grava em `pessoas`
  e dispara o acolhimento automático (as 6 mensagens são enfileiradas sozinhas).
- **Oração** — envia pedido (`pedidos_oracao`) + mural público + "Estou orando".
- **Agenda** — lê os cultos de `eventos`.
- **Mais** — quem somos, ministérios, contribuição, onde estamos (placeholders de conteúdo).

## Para rodar no seu PC (opcional)
```
npm install
npm run web
```
