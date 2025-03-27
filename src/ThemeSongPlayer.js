import React, { useState, useEffect } from "react";
import Howl from "react-howler";
import themeSong from "./audio/2pac - Hail Mary.mp3"; // Make sure to replace with the actual path to your theme song
import unmuteIcon from "./svg/weel/soundoff.svg"; // Path to your mute SVG
import muteIcon from "./svg/weel/sound.svg"; // Path to your unmute SVG

const ThemeSongPlayer = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMute = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="theme-song-player">
      <Howl
        src={themeSong}
        playing={isPlaying}
        loop={true}
        mute={isMuted}
        html5={true} // Use HTML5 Audio
        volume={0.25}
      />
      <button onClick={toggleMute} className="volume-button">
        <img
          className="VolumeBut"
          src={isPlaying ? muteIcon : unmuteIcon}
          alt="Volume Icon"
        />
      </button>
    </div>
  );
};

export default ThemeSongPlayer;
