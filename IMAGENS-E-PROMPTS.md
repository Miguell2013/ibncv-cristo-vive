# 🎨 Imagens do app IBNCV — nomes no Bunny + prompts

> ⚠️ O app só acha a imagem se o **nome do arquivo no Bunny** (pasta `ibncv/`)
> for EXATAMENTE um destes (tudo minúsculo, sem espaço, sem acento, `.png`).
> Caminho final: `https://amara-kiala.b-cdn.net/ibncv/<nome>`

## ✅ Você já gerou — confira/renomeie no Bunny pra estes nomes:

| Nome no Bunny | É a arte… |
|---|---|
| `logo.png` | Logo dourado IBNCV (peixe + chama) |
| `ev-celebracao.png` | Banner **Culto de Celebração** |
| `ev-vida-abundante.png` | Banner **Cultos Vida Abundante** |
| `ev-jovens.png` | Banner **Encontro de Jovens** |
| `ev-cafe-palavra.png` | Banner **Café com Palavra** |

## ⏳ Faltam gerar (no ChatGPT) e subir no Bunny com estes nomes:

| Nome no Bunny | Onde aparece | Tamanho |
|---|---|---|
| `hero.png` | Card grande da Home ("Cristo Vive / Assistir ao vivo") | 1600×900 (16:9) |
| `edif-reino.png` | Card "Reino ou Império" (Home) | 800×1000 (retrato) |
| `edif-21dias.png` | Card "21 Dias de Oração" (Home) | 800×1000 (retrato) |
| `acolhida.png` | Topo da tela de Acolhida (cadastro) | 1200×800 |
| `oracao.png` | Topo da tela de Oração | 1200×800 |

> 🔴 IMPORTANTE: essas 5 são **imagens LIMPAS, SEM TEXTO** — o app escreve o texto
> por cima. (Diferente dos banners de culto, que já têm o texto na arte.)

---

## ✍️ Prompts pra gerar no ChatGPT (mesma identidade: azul-noite + dourado)

**hero.png**
> Cinematic ultra-realistic 16:9 worship scene inside a modern church, a glowing
> golden cross on stage, a congregation with raised hands in silhouette, warm
> golden stage light against deep navy-blue darkness, volumetric light rays,
> premium cinematic atmosphere, deep navy (#0C1626) and gold (#E6B450) palette,
> NO TEXT, leave the left side darker for text overlay.

**edif-reino.png** (retrato/vertical)
> Vertical portrait, a confident Brazilian pastor preaching with a microphone,
> dramatic warm golden side light, deep navy background, cinematic, premium,
> shallow depth of field, navy and gold tones, NO TEXT.

**edif-21dias.png** (retrato/vertical)
> Vertical portrait, a person kneeling in prayer with hands clasped, silhouette
> against a warm golden sunrise, deep navy sky, serene and reverent, cinematic,
> premium, navy and gold palette, NO TEXT.

**acolhida.png**
> Warm welcoming scene, people embracing and smiling, golden light burst and lens
> flare on the right, deep navy background fading to gold, joyful and inviting,
> cinematic premium, navy (#0C1626) and gold (#E6B450) tones, NO TEXT.

**oracao.png**
> Close-up of hands clasped in prayer over an open Bible, soft warm golden light,
> deep navy dark background, intimate and reverent atmosphere, cinematic premium,
> navy and gold palette, NO TEXT.

---

## 🚀 Depois de subir as imagens, publique a nova versão do app:

```powershell
robocopy "$HOME\Documents\amara-kiala-stream\IBNCV-Cristo-Vive" "$HOME\Documents\ibncv-cristo-vive" /E /XD .git /XF .env
cd "$HOME\Documents\ibncv-cristo-vive"
git add .
git commit -m "Visual premium + imagens + horarios dos cultos"
git push
```
A Vercel republica sozinha em ~2 min. Aí abre o link e me manda um print. 🤍
