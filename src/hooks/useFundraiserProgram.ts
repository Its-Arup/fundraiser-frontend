import { AnchorProvider, Program, setProvider,} from '@coral-xyz/anchor';
import idl from '../anchor/idl/fundraiser.json'; // your compiled IDL
import {useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import type { Fundraiser } from '../anchor/types/fundraiser';


export function useFundraiserProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  if (!wallet) {
    return null;
  }

  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
 
  const program = new Program(idl as Fundraiser, provider);

  return program;
}
