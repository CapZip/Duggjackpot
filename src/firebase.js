// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJYElB8YSHeYW-BAL5YXDFd9xkpmIRGAs",
  authDomain: "forchune-2f26a.firebaseapp.com",
  projectId: "forchune-2f26a",
  storageBucket: "forchune-2f26a.appspot.com",
  messagingSenderId: "435505673751",
  appId: "1:435505673751:web:c611b20302e812e4890e52",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions();
const buyEntryCallable = httpsCallable(functions, "buyEntry");
export const fetchUserReferrals = httpsCallable(functions, "fetchReferrals");
export const updateUsername = async (walletAddress, username) => {
  const updateUsername = httpsCallable(functions, "updateUsername");
  return await updateUsername(walletAddress, username);
};
export const fetchParticipants = async (roundId) => {
  try {
    const participantsRef = collection(db, "participants");
    const q = query(participantsRef, where("matchId", "==", roundId));
    const querySnapshot = await getDocs(q);

    const participants = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const userDocRef = doc(db, "users", data.walletAddress);
      const userDoc = await getDoc(userDocRef);
      const username = userDoc.exists()
        ? userDoc.data().username
        : data.walletAddress;
      participants.push({ ...data, username });
    }

    return participants;
  } catch (error) {
    console.error("Error fetching participants: ", error);
    return [];
  }
};
export const buyEntry = async (
  walletAddress,
  signature,
  matchId,
  blockHeight,
) => {
  try {
    const result = await buyEntryCallable({
      walletAddress,
      signature,
      matchId,
      blockHeight,
    });
    return result.data;
  } catch (error) {
    console.error("Error buying entry: ", error);
    throw error;
  }
};
export const startReferring = async (walletAddress) => {
  try {
    const startReferringCallable = httpsCallable(functions, "startReferring");
    const result = await startReferringCallable({ walletAddress });
    return result.data;
  } catch (error) {
    console.error("Error starting referral process: ", error);
    throw error;
  }
};
export const fetchCurrentRound = async () => {
  try {
    const roundsRef = collection(db, "rounds");
    const q = query(roundsRef, orderBy("timestamp", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const currentRound = doc.data();
      currentRound.id = doc.id; // Include document ID
      return currentRound;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching current round: ", error);
    return null;
  }
};
export const checkOrCreateUserProfile = async (walletAddress) => {
  const checkOrCreateUser = httpsCallable(functions, "checkOrCreateUser");
  try {
    const result = await checkOrCreateUser({ walletAddress });
    return result.data.profile;
  } catch (error) {
    console.error("Error fetching or creating user profile:", error);
    throw error;
  }
};
