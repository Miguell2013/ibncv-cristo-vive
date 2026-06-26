import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Documento HTML raiz (somente web). Controla as meta tags do PWA:
// barra de status escura/transparente no iPhone e fundo escuro (sem faixa branca).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA — instalar na tela inicial em tela cheia */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Barra de status transparente: o fundo escuro do app aparece atrás do relógio/bateria */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cristo Vive" />
        <meta name="theme-color" content="#05090F" />

        {/* Manifest PWA — habilita instalação direta no Android */}
        <link rel="manifest" href="/manifest.json" />

        {/* Ícone da tela inicial (iPhone/Android) */}
        <link rel="apple-touch-icon" href="/icon-app.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-app.png" />
        <link rel="icon" type="image/png" href="/icon-app.png" />

        <ScrollViewStyleReset />

        {/* Fundo escuro desde o primeiro instante (antes do React montar) */}
        <style dangerouslySetInnerHTML={{ __html: rootBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const rootBackground = `
html, body, #root {
  background-color: #05090F;
}
body {
  overscroll-behavior-y: none;
}
`;
