import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                <title>OneMes</title>
                <meta name="title" content="ModeBook" />
                <meta name="description" content="Order Book on Mode!" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                {/* <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
                /> */}
                <meta property="og:url" content="https://modebook.a2n.finance/"></meta>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}