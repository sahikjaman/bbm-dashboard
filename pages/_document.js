import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="description" content="Dashboard monitoring konsumsi BBM real-time dengan Google Sheets integration" />
        <meta name="theme-color" content="#22d3ee" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
