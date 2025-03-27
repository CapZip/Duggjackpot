import { fetchCurrentRound } from "./firebase";

const fetchInfo = async () => {
  try {
    const currentRound = await fetchCurrentRound();
    if (currentRound) {
      console.log("Current Round: ", currentRound);
      // You can use this variable to feed into other parts of your app
      return currentRound;
    } else {
      console.log("No current round found");
      return null;
    }
  } catch (error) {
    console.error("Error in fetchInfo: ", error);
    return null;
  }
};

export default fetchInfo;
