import React, { useState, useEffect } from "react";

const CountdownTimer = ({ started, spinning }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!started) {
      setTimeLeft(60);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = started.toMillis();
      const elapsed = now - startTime;
      const secondsLeft = Math.max(60 - Math.floor(elapsed / 1000), 0);
      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [started]);

  let displayText;
  let customClass = "";

  if (timeLeft > 0) {
    displayText = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;
  } else if (spinning) {
    displayText = "Spinning...";
    customClass = "spinning-text"; // Add custom class for spinning state
  } else {
    displayText = "Pending Transactions";
    customClass = "pending-text"; // Add custom class for pending transactions state
  }

  return <span className={customClass}>{displayText}</span>;
};

export default CountdownTimer;
