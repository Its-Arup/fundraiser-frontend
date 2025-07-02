import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl,} from "@solana/web3.js";
import '@solana/wallet-adapter-react-ui/styles.css'
import { FundraiserComponent } from "./components/FundraiserComponent";
import { ContributeComponent } from "./components/ContributeComponent";

function App() {
  const wallets = [new PhantomWalletAdapter()];
  const network = "devnet"; // or testnet
  const endpoint = clusterApiUrl(network); 
  

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <FundraiserComponent />
          <ContributeComponent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
