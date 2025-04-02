import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import fetchInfo from "./fetchInfo";
import { fetchParticipants } from "./firebase";
import BuyEntryButton from "./BuyEntryButton";
import { onSnapshot, query, collection, where, doc } from "firebase/firestore";
import { getFirestore, Timestamp } from "firebase/firestore";
import { useWallet } from "@solana/wallet-adapter-react";
import wheelOverlay from "./svg/weel/svg.svg";
import ResultOverlay from "./ResultOverlay"; // Import the ResultOverlay component

const initialData = Array.from({ length: 10 }, () => ({
  option: "Empty",
  style: { backgroundColor: "lightgray" },
}));

const WheelComponent = ({ setStarted, setSpinning }) => {
  // Accept setStarted as a prop
  const { publicKey } = useWallet();
  const [participants, setParticipants] = useState(initialData);
  const [totalAmount, setTotalAmount] = useState(0);
  const [rawParts, setRawParts] = useState();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [isBuyEntryDisabled, setIsBuyEntryDisabled] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // State to manage overlay visibility
  const [result, setResult] = useState(null); // State to manage result
  const [amount, setAmount] = useState(null); // State to manage the amount won or lost
  const db = getFirestore();

  // Fetch initial round and participants
  useEffect(() => {
    const getCurrentRound = async () => {
      const round = await fetchInfo();
      if (round) {
        setCurrentRound(round);
        const participantsData = await fetchParticipants(round.id);
        updateParticipants(participantsData);
        setRawParts(participantsData);
      }
    };

    getCurrentRound();
  }, []);

  // Set up listener for winnerIndex in current round
  useEffect(() => {
    let unsubscribeRound;
    if (currentRound && currentRound.id) {
      unsubscribeRound = onSnapshot(
        doc(db, "rounds", currentRound.id),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const roundData = docSnapshot.data();

            // Check if winnerIndex field exists and is not undefined
            if (roundData.winnerIndex !== undefined) {
              setPrizeNumber(roundData.winnerIndex);
              setMustSpin(true);
              setSpinning(true);
              setTimeout(async () => {
                const newRound = await fetchInfo();
                setCurrentRound(newRound);
                setStarted(null);
                if (newRound) {
                  const participantsData = await fetchParticipants(newRound.id);
                  updateParticipants(participantsData);
                  setRawParts(participantsData);
                  setTimeout(async () => {
                    setShowOverlay(false);
                  }, 2000);
                }
              }, 14000);
            }
            if (roundData.started) {
              setStarted(roundData.started); // Update started state
              const now = Timestamp.now().toMillis();
              const started = roundData.started.toMillis();
              const elapsed = now - started;
              if (elapsed >= 55000) {
                setIsBuyEntryDisabled(true);
              } else {
                setIsBuyEntryDisabled(false);
              }
            }
          }
        },
      );

      return () => unsubscribeRound();
    }
  }, [currentRound, setStarted]);

  // Set up listener for participants
  useEffect(() => {
    let unsubscribeParticipants;
    if (currentRound && currentRound.id) {
      const participantsQuery = query(
        collection(db, "participants"),
        where("matchId", "==", currentRound.id),
      );

      unsubscribeParticipants = onSnapshot(
        participantsQuery,
        async (querySnapshot) => {
          const participantsData = [];
          for (const doc of querySnapshot.docs) {
            participantsData.push(doc.data());
          }
          const enrichedParticipants = await fetchParticipants(currentRound.id);
          updateParticipants(enrichedParticipants);
          setRawParts(participantsData);
        },
      );

      return () => unsubscribeParticipants();
    }
  }, [currentRound, publicKey]);

  const colors = [
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
    "#FF9B17",
  ];

  const updateParticipants = (participantsData, entryFee) => {
    const updatedParticipants = participantsData.map((participant, index) => ({
      option:
        publicKey && participant.walletAddress === publicKey.toString()
          ? "YOU"
          : participant.username,
      style: { backgroundColor: colors[index % colors.length] },
    }));

    // Preserve the initial empty slots for visual effect
    for (let i = updatedParticipants.length; i < initialData.length; i++) {
      updatedParticipants.push(initialData[i]);
    }

    setParticipants(updatedParticipants);
    if (currentRound) {
      setTotalAmount(participantsData.length * currentRound.entry); // Calculate and set the total amount
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setSpinning(false);

    // Determine the result and amount
    const winningWallet = rawParts[prizeNumber]?.walletAddress;

if (publicKey && currentRound) {
  if (winningWallet === publicKey.toString()) {
    setResult("win");
    setAmount(participants.length * currentRound.entry); // total pot
  } else {
    const userEntries = rawParts.filter(
      (participant) => participant.walletAddress === publicKey.toString(),
    ).length;
    if (userEntries > 0) {
      setResult("lose");
      setAmount(userEntries * currentRound.entry); // Set the losing amount
    } else {
      setShowOverlay(false);
      return;
    }
  }

  setShowOverlay(true);
}
  };
  return (
    <div className="wheel-container">
      {" "}
      {/* Added className for styling */}
      <div className="wheel-wrapper">
        <div className="wheel">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={participants}
            onStopSpinning={handleStopSpinning}
            backgroundColors={["#3e3e3e", "#df3428"]}
            textColors={["#ffffff"]}
            pointerProps={{ src: "https://i.imgur.com/yeR3JqL.png" }}
            fontSize={25}
            radiusLineWidth={3}
            fontWeight="lighter"
            fontFamily="Pocket Monk"
          />
          <img src={wheelOverlay} alt="Wheel Overlay" className="overlay" />
          <div className="total-amount">{totalAmount.toFixed(1)} SOL</div>
        </div>
      </div>
      <BuyEntryButton
        currentRound={currentRound}
        disabled={isBuyEntryDisabled}
      />
      <ResultOverlay show={showOverlay} result={result} amount={amount} />
    </div>
  );
};

export default WheelComponent;
