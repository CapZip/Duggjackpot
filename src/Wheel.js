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
  const [timeLeft, setTimeLeft] = useState(61);
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
  useEffect(() => {
    if (!currentRound?.id) return;
  
    const roundDocRef = doc(db, "rounds", currentRound.id);
    const unsubscribe = onSnapshot(roundDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) return;
  
      const roundData = docSnapshot.data();
  
      if (
        roundData.winnerIndex !== undefined &&
        roundData.winnerIndex !== null &&
        roundData.winnerIndex !== prizeNumber // ✅ Only update if actually different
      ) {
        console.log("⏲️ Winner index updated:", roundData.winnerIndex);
        setPrizeNumber(roundData.winnerIndex);
      }
    });
  
    return () => unsubscribe();
  }, [currentRound?.id, prizeNumber]); 
  // Set up listener for winnerIndex in current round
  useEffect(() => {
    let unsubscribeRound;
    let countdownInterval;
    let lastStartedTimestamp = null;
  
    if (currentRound && currentRound.id) {
      unsubscribeRound = onSnapshot(
        doc(db, "rounds", currentRound.id),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const roundData = docSnapshot.data();
  
            // ✅ Only run timer logic if `started` is new
            if (
              roundData.started &&
              (!lastStartedTimestamp ||
                roundData.started.toMillis() !== lastStartedTimestamp)
            ) {
              lastStartedTimestamp = roundData.started.toMillis();
              setStarted(roundData.started);
  
              const started = lastStartedTimestamp;
              const now = Date.now();
              const elapsed = now - started;
              const secondsLeft = Math.max(61 - Math.floor(elapsed / 1000), 0);
  
              setTimeLeft(secondsLeft);
  
              setIsBuyEntryDisabled(secondsLeft >= 50);
  
              if (countdownInterval) clearInterval(countdownInterval);
  
              countdownInterval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - started;
                const remaining = Math.max(61 - Math.floor(elapsed / 1000), 0);
                setTimeLeft(remaining);
                console.log(remaining);
                if (remaining <= 0) {
                  clearInterval(countdownInterval);
                }
              }, 1000);
            }
          }
        }
      );
    }
  
    return () => {
      if (unsubscribeRound) unsubscribeRound();
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [currentRound, setStarted]);
  const [hasSpun, setHasSpun] = useState(false);

useEffect(() => {
  if (
    prizeNumber !== null &&
    !hasSpun && timeLeft === 0)
      {
        console.log("Spinning...");
          setMustSpin(true);
          setSpinning(true);
          setHasSpun(true);
      }
}, [prizeNumber, hasSpun, timeLeft]);
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
      
          // ✅ Sort by timestamp to match backend logic
          participantsData.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      
          const enrichedParticipants = await fetchParticipants(currentRound.id);
          updateParticipants(enrichedParticipants);
          setRawParts(participantsData); // sorted!
        },
      );

      return () => unsubscribeParticipants();
    }
  }, [currentRound, publicKey]);

  const colors = [
    "#FF9B17",
    "#d159a5",
    "#7259d1",
    "#5994d1",
    "#59ced1",
    "#59d187",
    "#65d159",
    "#f1ea38",
    "#f1385e",
    "#948102",
  ];

  const updateParticipants = (participantsData) => {
    const updatedWallets = participantsData.map((p) => p.walletAddress);
    const currentWallets = participants.map((p) =>
      p.option === "YOU" ? publicKey?.toString() : p.option
    );
  
    const same =
      updatedWallets.length === currentWallets.length &&
      updatedWallets.every((addr, i) => addr === currentWallets[i]);
  
    if (same) return; // ✅ Skip update if same wallets
  
    const updatedParticipants = participantsData.map((participant, index) => ({
      option:
        publicKey && participant.walletAddress === publicKey.toString()
          ? "YOU"
          : participant.username,
      style: { backgroundColor: colors[index % colors.length] },
    }));
  
    for (let i = updatedParticipants.length; i < initialData.length; i++) {
      updatedParticipants.push(initialData[i]);
    }
    console.log("Participants Updated");
    setParticipants(updatedParticipants);
    if (currentRound) {
      setTotalAmount(participantsData.length * currentRound.entry);
    }
  };

  const handleStopSpinning = async () => {
    setTimeout(() => {
      setMustSpin(false);
      setSpinning(false);
    }, 4000);
  
    const winningWallet = rawParts[prizeNumber]?.walletAddress;
  
    // Result logic only if wallet is connected
    if (publicKey && currentRound) {
      if (winningWallet === publicKey.toString()) {
        setResult("win");
        setAmount(participants.length * currentRound.entry);
      } else {
        const userEntries = rawParts.filter(
          (participant) => participant.walletAddress === publicKey.toString()
        ).length;
  
        if (userEntries > 0) {
          setResult("lose");
          setAmount(userEntries * currentRound.entry);
        }
      }
  
      setShowOverlay(true);
    }
  
    // ✅ Always reset round even if wallet isn't connected
    setTimeout(async () => {
      const newRound = await fetchInfo();
      setCurrentRound(newRound);
      setPrizeNumber(null);
      setTotalAmount(0);
      setStarted(null);
  
      if (newRound) {
        const participantsData = await fetchParticipants(newRound.id);
        updateParticipants(participantsData);
        setRawParts(participantsData);
      }
  
      setTimeout(() => {
        setShowOverlay(false);
        setTimeLeft(61);
        setHasSpun(false); // allow spin again next time
      }, 2000);
    }, 5000); // give 5s delay after wheel stops
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
          <div className="total-amount">
  {typeof totalAmount === "number" && !isNaN(totalAmount)
    ? totalAmount.toFixed(1)
    : "0.0"}{" "}
  SOL
</div>
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
