import { Audio } from "expo-av";
export const playFinishedSound = async () => {
  const sound = new Audio.Sound();
  try {
    await sound.loadAsync(require("../assets/note.wav"));
    await sound.playAsync();
    // Your sound is playing!
  } catch (error) {
    console.error(error);
  }
};
