# 🚀 COMANDO — Colocar o app da Igreja (IBNCV) no ar

> O app já está **pronto e validado** no seu PC, na pasta
> `Documentos\amara-kiala-stream\IBNCV-Cristo-Vive`.
> O Claude não consegue acessar GitHub/Vercel (bloqueados), então estes 3 passos
> são feitos por você. Leva ~10 minutos. Qualquer dúvida em um passo, me chama.

---

## PASSO 1 — Criar o repositório no GitHub  (~2 min)

1. Entre em **github.com** (logado na conta `Miguell2013`).
2. Canto superior direito → **+** → **New repository**.
3. **Repository name:** `ibncv-cristo-vive`
4. Deixe **Public** (ou Private, tanto faz).
5. **NÃO** marque "Add a README".
6. Clique **Create repository**.

---

## PASSO 2 — Subir a pasta  (escolha A **ou** B)

### ✅ Opção A — PowerShell (recomendado, mais limpo)

Abra o **PowerShell** e cole estes comandos (um bloco de cada vez).
> O `.env` NÃO sobe (o `.gitignore` já bloqueia). As chaves vão na Vercel (Passo 3).

**1) Copiar a pasta pra fora do repo do Amara (pra não misturar):**
```powershell
Copy-Item "$HOME\Documents\amara-kiala-stream\IBNCV-Cristo-Vive" "$HOME\Documents\ibncv-cristo-vive" -Recurse -Force
cd "$HOME\Documents\ibncv-cristo-vive"
```

**2) Iniciar o git e fazer o commit:**
```powershell
git init
git add .
git commit -m "App IBNCV Cristo Vive"
git branch -M main
```

**3) Ligar no GitHub e enviar:**
```powershell
git remote add origin https://github.com/Miguell2013/ibncv-cristo-vive.git
git push -u origin main
```
> Na primeira vez pode abrir uma janela pedindo pra você logar no GitHub. É só
> autorizar. Quando terminar, atualize a página do repositório: os arquivos
> estarão lá. ✔

**Tem o GitHub CLI (`gh`)?** Então pula o Passo 1 e faz tudo num comando só
(depois do bloco 2):
```powershell
gh repo create ibncv-cristo-vive --public --source=. --push
```

> Se der "git não é reconhecido", o git não está instalado → use a Opção B.

---

### Opção B — Arrastar no navegador (sem PowerShell)

1. Na página do repositório novo, clique em **"uploading an existing file"**.
2. Abra a pasta `Documentos\amara-kiala-stream\IBNCV-Cristo-Vive` no Explorer.
3. **Ctrl+A** pra selecionar tudo → **arraste** pra caixa de upload do GitHub
   (ele mantém as subpastas).
4. Clique no botão verde **Commit changes**.
   > Se aparecer o `.env`, pode deixar (a chave é pública) ou desmarcar.

---

## PASSO 3 — Publicar na Vercel  (~4 min)

1. Entre em **vercel.com** (faça login **com o GitHub**, conta `Miguell2013`).
2. **Add New… → Project**.
3. Encontre `ibncv-cristo-vive` na lista → **Import**.
4. Em **Build & Output Settings** (clique pra expandir), confira/ajuste:
   - **Framework Preset:** Other (ou Expo, se aparecer)
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
5. Em **Environment Variables**, adicione estas 3 (nome → valor):

   | Name | Value |
   |---|---|
   | `EXPO_PUBLIC_SUPABASE_URL` | `https://uldssazirjhkbptankcq.supabase.co` |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_g8zbxisVWgtVgYCV50rkYA_3gD2bF6W` |
   | `EXPO_PUBLIC_CDN_BASE` | `https://amara-kiala.b-cdn.net/ibncv` |

6. Clique **Deploy** e aguarde (~2 min).
7. No fim, a Vercel te dá um **link** (ex.: `ibncv-cristo-vive.vercel.app`).
   **Me manda esse link** que eu confirmo se está tudo funcionando. 🤍

---

## Depois (eu cuido)
- Conferir se as imagens do Bunny aparecem (e ajustar nomes se preciso).
- Trocar o ícone/splash placeholder pela logo real.
- Ligar o push e montar o painel da equipe.
