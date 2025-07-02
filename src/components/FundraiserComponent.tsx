import { useEffect, useState } from "react";
import { useFundraiserProgram } from "../hooks/useFundraiserProgram"; // Make sure this hook is imported correctly
import { PublicKey, SystemProgram, } from "@solana/web3.js"; // Transaction handling from solana
import { BN,} from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const FundraiserComponent = () => {
  const program = useFundraiserProgram();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fundraiserStatus, setFundraiserStatus] = useState<string | null>(null); // Track status
  const MINT = new PublicKey("2A7RqVGvoNjc8m7YUmsNQDJ83AUtHyjM4k8dLLabN7Dq"); // Replace with your actual mint address

  console.log("Program:", program);
  console.log("Wallet Public Key:", program?.provider.wallet?.publicKey?.toBase58());
    
  useEffect(() => {
    if (program) {
      const checkWalletConnection = async () => {
        if (program.provider.wallet?.publicKey) {
          setIsWalletConnected(true);
        }
        setIsLoading(false); // Set loading to false after checking wallet
      };

      checkWalletConnection();
    }
  }, [program]);

  // Function to initialize the fundraiser
  const initializeFundraiser = async () => {
    try {
    
        if (!program || !program.provider.wallet) {
          setFundraiserStatus('Program or wallet not available. Please connect your wallet.');
            return;
        }
      // Setup initial values
      const maker = program.provider.wallet.publicKey;
      const mintToRaise = MINT; // The mint for the SPL token
      const amountToRaise  = new BN(1000000); // Target amount for the fundraiser
      const duration = 0; // Duration in days

      const [fundraiser, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('fundraiser'), maker.toBuffer()],
        program.programId
      );

      const vault = getAssociatedTokenAddressSync(mintToRaise, fundraiser, true);

      console.log("Fundraiser Address:", fundraiser.toBase58());
      console.log("Vault Address:", vault.toBase58());
      console.log("Maker Address:", maker.toBase58());

      // Initialize the fundraiser
      const tx = await program.methods.initialize(amountToRaise, duration).accounts({
        maker: maker,
        fundraiser: fundraiser,
        mintToRaise: mintToRaise,
        vault: vault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }).rpc();

      setFundraiserStatus(`Fundraiser initialized with tx: ${tx}`);
    } catch (error :any) {
      console.error('Error initializing fundraiser:', error);
      const logs = await error.getLogs();
      console.error('Transaction Logs:', logs);
      setFundraiserStatus('Error initializing fundraiser. Please check the console for details.');
    } finally {
    //   setLoading(false);
    }
  };




  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isWalletConnected) {
    return <div>Please connect your wallet.</div>;
  }

  return (
    <>
      <div className="text-3xl font-bold text-center">
        Wallet connected and Fundraiser Program initialized.
      </div>

      {/* Display status message (success or error) */}
      {fundraiserStatus && (
        <div className="mt-4 text-center">
          <p
            className={
              fundraiserStatus.includes("Error")
                ? "text-red-500"
                : "text-green-500"
            }
          >
            {fundraiserStatus}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-center items-center">
        <button
          onClick={initializeFundraiser} // Trigger fundraiser initialization
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
        >
          Start Fundraiser
        </button>
      </div>
    </>
  );
};


