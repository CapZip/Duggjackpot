import React, { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import AffiliatesModal from "./AffiliatesModal";
import ThemeSongPlayer from "./ThemeSongPlayer";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HowItWorks from "./HowItWorks"; // Make sure to create this component
import Header from "./Headers";
import WheelComponent from "./Wheel";
import man from "./svg/weel/character.svg";
import icon1 from "./svg/weel/tg.svg";
import icon2 from "./svg/weel/x.svg";
import icon3 from "./svg/weel/Dex.svg";
import icon4 from "./svg/weel/pumpfun.svg";
import weels from "./svg/weel/weelsS1.svg";
import timerBackground from "./svg/weel/timer.svg";
import "./App.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import * as buffer from "buffer";
import CountdownTimer from "./CountdownTimer"; // Add this import
window.Buffer = buffer.Buffer;
export default function App() {
  const [started, setStarted] = useState(null); // Add state for started
  const [spinning, setSpinning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add state for modal
  const [isAffiliatesOpen, setIsAffiliatesOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openAffiliates = () => setIsAffiliatesOpen(true);
  const closeAffiliates = () => setIsAffiliatesOpen(false);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );
  return (
    <ConnectionProvider endpoint="https://fittest-icy-field.solana-mainnet.quiknode.pro/6fbfeeff12d8d6537bafad49b437ca821085d17a/">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="background-container">
            <div className="App">
              <Router>
                <Header
                  openModal={openModal}
                  onReferralsClick={openAffiliates}
                />
                <ThemeSongPlayer />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div className="main-content">
                        <div className="left-side">
                          <div className="wheel-container">
                            <WheelComponent
                              setStarted={setStarted}
                              setSpinning={setSpinning}
                            />{" "}
                            {/* Pass setStarted as a prop */}
                          </div>
                          <div className="icon-stage">
                            <a href="https://t.me/weelofforchune" id="telegram">
                              <img
                                src={icon1}
                                alt="Icon 1"
                                className="stage-icon"
                                style={{ width: "130px", height: "130px" }}
                              />
                            </a>
                            <a href="https://x.com/weelofforchune" id="twitter">
                              <img
                                src={icon2}
                                alt="Icon 2"
                                className="stage-icon"
                                style={{ width: "130px", height: "130px" }}
                              />
                            </a>
                            <a
                              href="https://pump.fun/FpcbvqmEPA68ozUyd9jR1XY3RHSsb9nbUJgtxEVYpump"
                              id="pumpfun"
                            >
                              <img
                                src={icon4}
                                alt="Icon 2"
                                className="stage-icon"
                                style={{ width: "130px", height: "130px" }}
                              />
                            </a>
                            <a
                              href="https://dexscreener.com/solana/772w6gvhskcfy43d4jy2zn7avoasktfskhgjuesyrqhl"
                              id="dexscreener"
                            >
                              <img
                                src={icon3}
                                alt="Icon 2"
                                className="stage-icon"
                                style={{ width: "130px", height: "130px" }}
                              />
                            </a>
                          </div>
                        </div>
                        <div className="right-side">
                          <div className="timer">
                            <img src={timerBackground} alt="Timer Background" />
                            <div
                              className={`timer-text ${started ? "active" : ""}`}
                            >
                              {started ? (
                                <CountdownTimer
                                  started={started}
                                  spinning={spinning}
                                />
                              ) : (
                                "Waiting for players"
                              )}
                            </div>
                          </div>
                          <div className="man-svg">
                            <img src={man} alt="Weel of Forchune Man" />
                          </div>
                          <div className="weels-svg">
                            <img src={weels} alt="Weel of Forchune Weels" />
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                </Routes>
              </Router>
              <HowItWorks isOpen={isModalOpen} onClose={closeModal} />{" "}
              {/* Include the modal */}
              <AffiliatesModal
                isOpen={isAffiliatesOpen}
                onRequestClose={closeAffiliates}
              />
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
