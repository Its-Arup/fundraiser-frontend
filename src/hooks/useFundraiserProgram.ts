import { useMemo } from "react";
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "../anchor/idl/fundraiser.json"; // your compiled IDL
import type { Fundraiser } from "../anchor/types/fundraiser";


export function useFundraiserProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  console.log("Connection:", connection);
  console.log("Wallet:",  wallet?.publicKey.toBase58());

  
  const program = useMemo(() => {
    if (!wallet || !connection) {
      return null; // Return null if either wallet or connection is not available
    }

    const provider = new AnchorProvider(connection, wallet, {});
    setProvider(provider); // Setting the provider globally for Anchor

    return new Program(idl as Fundraiser, provider); // Creating the program instance using the IDL and provider
  }, [connection, wallet]);
  return program;
}