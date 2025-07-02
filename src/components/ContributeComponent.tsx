import { useState } from "react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BN, getProvider } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, // Correct method
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useFundraiserProgram } from "../hooks/useFundraiserProgram";
import { useWallet } from "@solana/wallet-adapter-react";


export const ContributeComponent = () => {
  const program = useFundraiserProgram();
  const [contributionStatus, setContributionStatus] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(0); // Store the amount to contribute
  const { wallet } = useWallet();
  const MINT = new PublicKey("2A7RqVGvoNjc8m7YUmsNQDJ83AUtHyjM4k8dLLabN7Dq"); // Replace with actual mint address

  // Function to handle contribution
  const contribute = async () => {
    try {
      if (!program || !program.provider.wallet) {
        setContributionStatus(
          "Program or wallet not available. Please connect your wallet."
        );
        return;
      }

      const maker = program.provider.wallet.publicKey;
      const payer = wallet;
      const mintToRaise = MINT;
      const amountToContribute = new BN(contributionAmount); // Convert to BN for the transfer
  

      // Find the fundraiser and vault addresses using the program address seeds
       const [fundraiser, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('fundraiser'), maker.toBuffer()],
        program.programId
      );

      const vault = getAssociatedTokenAddressSync(mintToRaise, fundraiser, true);


      console.log(getProvider());
      

      console.log("Fundraiser Address:", fundraiser.toBase58());
      console.log("Vault Address:", vault.toBase58());
      
      // Ensure that the amount is within the allowed contribution range
      const MIN_CONTRIBUTION = new BN(1); // Example: minimum contribution is 1 token
      const MAX_CONTRIBUTION = new BN(1000); // Example: maximum contribution is 1000 tokens
      
      if (amountToContribute.lt(MIN_CONTRIBUTION)) {
        setContributionStatus("Contribution too small.");
        return;
      }
      
      if (amountToContribute.gt(MAX_CONTRIBUTION)) {
        setContributionStatus("Contribution exceeds the maximum limit.");
        return;
      }
      
      // Initialize the contribution account if needed (will be added to contributor's account)
      const contributor = PublicKey.findProgramAddressSync(
        [Buffer.from('contributor'), fundraiser.toBuffer(), program.provider.wallet.publicKey.toBuffer()],
        program.programId,
      )[0];
      
      console.log("Contributor Address:", contributor.toBase58());
      
      const contributorATA = (await getOrCreateAssociatedTokenAccount(
        getProvider().connection, 
        payer as any, // Pass the wallet as the payer for the transaction fees
        mintToRaise, 
        maker // The owner of the token account
      )).address;

      console.log("Contributor ATA Address:", contributorATA.toBase58());

      // Perform the transfer of tokens from contributor to vault (fundraiser)
      const tx = await program.methods
        .contribute(amountToContribute)
        .accounts({
          contributor: maker,
          fundraiser: fundraiser,
          contributorAccount: contributor,
          contributorAta: contributorATA,
          vault: vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setContributionStatus(`Contribution successful! Transaction: ${tx}`);
    } catch (error: any) {
      console.error("Error contributing to fundraiser:", error);
      setContributionStatus(
        "Error contributing to fundraiser. Please check the console for details."
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold text-center">Contribute to Fundraiser</div>
      <input
        type="number"
        value={contributionAmount}
        onChange={(e) => setContributionAmount(Number(e.target.value))}
        className="mt-4 p-2 border border-gray-300 rounded"
        placeholder="Enter amount to contribute"
      />
      <button
        onClick={contribute}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
      >
        Contribute
      </button>

      {/* Display status message (success or error) */}
      {contributionStatus && (
        <div className="mt-4 text-center">
          <p
            className={
              contributionStatus.includes("Error")
                ? "text-red-500"
                : "text-green-500"
            }
          >
            {contributionStatus}
          </p>
        </div>
      )}
    </div>
  );
};
