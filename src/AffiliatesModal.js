import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useWallet } from "@solana/wallet-adapter-react";
import "./AffiliatesModal.css";
import Swal from "sweetalert2";
import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import {
  startReferring,
  checkOrCreateUserProfile,
  fetchUserReferrals,
  updateUsername,
} from "./firebase"; // Import the necessary functions
const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});
const ReferralModal = ({ isOpen, onRequestClose }) => {
  const { publicKey } = useWallet();
  const [referralId, setReferralId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const fetchReferralId = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const userProfile = await checkOrCreateUserProfile(publicKey.toString());
      if (userProfile.referralId) {
        setReferralId(userProfile.referralId);
        setUsername(userProfile.username);
        // Assume we have a function to fetch referrals based on referralId
        const userReferrals = await fetchUserReferrals({
          walletAddress: publicKey.toString(),
        });
        setReferrals(userReferrals.data.referrals);
      }
    } catch (error) {
      setError("Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralId();
  }, [publicKey]);

  const handleStartReferring = async () => {
    if (!publicKey) {
      Toast.fire({
        icon: "error",
        title: "Please Connect your wallet first.",
        timer: 1500,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await startReferring(publicKey.toString());
      setReferralId(result.referralId);
      fetchReferralId();
    } catch (error) {
      setError("Failed to start referral process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://wof.lol/?x=${referralId}`);
    Toast.fire({
      icon: "success",
      title: "Referral link copied to clipboard!",
      timer: 1500,
    });
  };
  const handleEditUsername = async () => {
    if (isEditing) {
      if (username.length > 10) {
        setError("Username cannot be longer than 10 characters.");
        return;
      }
      if (username.includes(" ")) {
        setError("Username cannot contain spaces.");
        return;
      }
      if (matcher.hasMatch(username)) {
        setError("Username contains inappropriate language.");
        return;
      }
      try {
        await updateUsername({ walletAddress: publicKey.toString(), username });
        Toast.fire({
          icon: "success",
          title: "Username updated!",
          timer: 1500,
        });
      } catch (error) {
        if (error.code === "failed-precondition") {
          setError("You can only change your username once every 24 hours.");
        } else if (error.code === "already-exists") {
          setError("Username is already taken.");
        } else {
          setError("Failed to update username. Please try again.");
        }
      }
    }
    setIsEditing(!isEditing);
  };
  useEffect(() => {
    if (error) {
      Toast.fire({
        icon: "error",
        title: "Please make sure you hold atleast 1 million $DUGG",
        timer: 1500,
      });
    }
    setError();
  }, [error]);
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <h2>My Referrals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : referralId ? (
        <div>
          <div className="username-container">
            <input
              type="text"
              value={username}
              readOnly={!isEditing}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />
            <button
              onClick={handleEditUsername}
              className={`edit-button ${isEditing ? "finish" : ""}`}
            >
              {isEditing ? "Apply Changes" : "Edit Username"}
            </button>
          </div>
          <div className="referral-link">
            <input
              type="text"
              value={`https://wof.lol/?x=${referralId}`}
              readOnly
              className="referral-input"
            />
            <button onClick={handleCopyLink} className="copy-button">
              Copy Link
            </button>
          </div>
          <h3>Referral List</h3>
          <ul className="referral-list">
            {referrals.map((referral, index) => (
              <li key={index} className="referral-item">
                {referral.name} <button className="claim-button">Claim</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>Start referring and earn rewards!</p>
          <button
            onClick={handleStartReferring}
            disabled={loading}
            className="referbut"
          >
            {loading ? "Processing..." : "Start Referring"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
      <button onClick={onRequestClose} className="close-buttons">
        Close
      </button>
    </Modal>
  );
};

export default ReferralModal;
