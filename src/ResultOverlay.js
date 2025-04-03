import React, { useState, useEffect } from "react";
import "./App.css"; // Import the CSS for the overlay
import winOverlay from "./svg/weel/Youwin.svg";
import lostOverlay from "./svg/weel/Youlost.svg";
import winOverlaymob from "./svg/weel/YouWin_mob.svg";
import lostOverlaymob from "./svg/weel/YouLost_mob.svg";

const ResultOverlay = ({ show, result, amount }) => {
  const [imageSrc, setImageSrc] = useState(
    result === "win" ? winOverlay : lostOverlay,
  );

  useEffect(() => {
    const updateImageSrc = () => {
      if (window.innerWidth < 500) {
        setImageSrc(result === "win" ? winOverlaymob : lostOverlaymob);
      } else {
        setImageSrc(result === "win" ? winOverlay : lostOverlay);
      }
    };

    // Update the image source on component mount
    updateImageSrc();

    // Add event listener for window resize
    window.addEventListener("resize", updateImageSrc);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateImageSrc);
    };
  }, [result]);

  if (!show) return null;

  return (
    <div className="overlay-container">
      <img src={imageSrc} alt={result} className="overlay-image" />
      <div className="overlay-text">
        <span>
        {result === "win" ? "+" : "-"}
  {typeof amount === "number" && !isNaN(amount) ? amount.toFixed(1) : "0.0"}
        </span>
        <br />
        <span>SOL</span>
      </div>
    </div>
  );
};

export default ResultOverlay;
