import React, { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useWallet } from "@solana/wallet-adapter-react";

const Header = ({ openModal, onReferralsClick }) => {
  const { publicKey } = useWallet();
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      if (publicKey) {
        const functions = getFunctions();
        const checkOrCreateUser = httpsCallable(functions, "checkOrCreateUser");

        try {
          const result = await checkOrCreateUser({
            walletAddress: publicKey.toString(),
          });
          setUserProfile(result.data.profile);
          console.log(result.data.profile.walletAddress);

          const params = new URLSearchParams(location.search);
          const referralId = params.get("x");

          if (referralId && !result.data.profile.referredBy) {
            const setReferredBy = httpsCallable(functions, "setReferredBy");
            await setReferredBy({
              walletAddress: publicKey.toString(),
              referralId,
            });
            console.log("Referral ID set successfully.");
          }
        } catch (error) {
          console.error("Error fetching or creating user profile:", error);
        }
      }
    };

    fetchOrCreateUserProfile();
  }, [publicKey, location.search]);

  return (
    <header className="header">
      <div className="header-wrapper">
        <h1 className="site-name">
          <Link to="/">Weel of Forchune</Link>
        </h1>
        <div className="right-sectionhead">
          <button onClick={openModal}>How It Works</button>
          {publicKey && (
            <button onClick={onReferralsClick}>My Referrals</button>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
