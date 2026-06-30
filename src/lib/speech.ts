import * as Speech from "expo-speech";

export function speak(text: string): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: "en-GB", rate: 0.85, pitch: 1.05 });
  } catch {
    // TTS is best-effort; never throw into the UI.
  }
}
