import React from "react";
import Modal from "react-modal"; // Create this CSS file for styling

Modal.setAppElement("#root"); // Ensure accessibility

const HowItWorksModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="How It Works"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2>How It Works</h2>
      <div className="how-it-works-content">
        <h3>
          Welcome to <strong>Weel of Forchune</strong>
        </h3>
        <p>A dApp developed for the purpose of degens.</p>

        <h4>Step 1: Enter the Game</h4>
        <p>
          Each entry into the game is listed on the button. You can enter as
          many times as you like, increasing your chances of winning!
        </p>

        <h4>Step 2: The Countdown Begins</h4>
        <p>
          Once there are 10 participants, a 1-minute countdown begins. During
          this time, more users can join to increase the pot and improve their
          odds.
        </p>

        <h4>Step 3: Spin the Wheel</h4>
        <p>
          When the timer reaches zero, the wheel spins to select the lucky
          winner. The winner receives the entire pot!
        </p>

        <h4>Benefits</h4>
        <ul>
          <li>Minimal transaction fees.</li>
          <li>
            75% of daily revenue is burned into our coin, increasing its value
            each day.
          </li>
          <li>
            Opportunity for partner coins to burn their supply by sponsoring
            wheel pots.
          </li>
          <li>Referral System that let's users claim some SOL per user.</li>
        </ul>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default HowItWorksModal;
