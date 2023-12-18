import 'antd/dist/reset.css';
import type { AppProps } from 'next/app';
import { Provider } from "react-redux";
import { useEffect, useState } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { modeTestnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import { ConfigProvider, theme } from 'antd';
import { store } from 'src/controller/store';
const { defaultAlgorithm, darkAlgorithm } = theme;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [modeTestnet],
  [
    publicProvider()
  ]
)

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (typeof window !== 'undefined') {
    window.onload = () => {
      document.getElementById('holderStyle')!.remove();
    };
  }

  return (
    <WagmiConfig config={config}>
      <style
        id="holderStyle"
        dangerouslySetInnerHTML={{
          __html: `
                    *, *::before, *::after {
                        transition: none!important;
                    }
                    `,
        }}
      />

      <div style={{ visibility: !mounted ? 'hidden' : 'visible', backgroundColor: "#302F2F", height: "100vh", overflowY: "auto"}}>
        <Provider store={store}>

          <ConfigProvider
            theme={{
              token: {
                borderRadius: 16,
                colorPrimary: "#3a2ad3"
              },
              algorithm: darkAlgorithm
            }}
          >
            <Component {...pageProps} />
          </ConfigProvider>
        </Provider>
      </div>
    </WagmiConfig>
  )
}
