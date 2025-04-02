// BuyEntryButton.js
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { buyEntry } from "./firebase";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import Swal from "sweetalert2";
import { useConnection } from "@solana/wallet-adapter-react";
const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});
const BuyEntryButton = ({ currentRound, disabled }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  const handleBuyEntry = async () => {
    if (!publicKey) {
      Toast.fire({
        icon: "error",
        title: "Please Connect your wallet first.",
        timer: 1500,
      });
      return;
    }
    setLoading(true);
    let totalam = currentRound.entry + 0.01;
    console.log(totalam);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(
            "B9c8rFHtE28DL7Fw9Hx2sZsYgbGrtUojrjmnbRMj9xtn",
          ), // Replace with the correct recipient address
          lamports: totalam * LAMPORTS_PER_SOL,
        }),
      );

      const blockHeight = await connection.getBlockHeight(); // Fetch the current block height

      const signature = await sendTransaction(transaction, connection);
      // Pass the transaction details to the server for confirmation
      const result = await buyEntry(
        publicKey.toString(),
        signature,
        currentRound.id,
        blockHeight,
      );
      Toast.fire({
        icon: "success",
        title: "Entry succesful!",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error processing entry: ", error);
      Toast.fire({
        icon: "error",
        title: "Error processing entry: " + error.message,
        timer: 1500,
      });
    }

    setLoading(false);
  };

  return (
    <button
      className="buyentrybutton"
      onClick={handleBuyEntry}
      disabled={loading || disabled}
    >
      {loading ? (
        "Processing..."
      ) : (
        <>
          <span className="buyin">BUY IN</span>
          <span className="for">for</span>
          <span className="amount">
            {currentRound ? currentRound.entry : 0.25} SOL
          </span>
        </>
      )}
    </button>
  );
};

export default BuyEntryButton;
