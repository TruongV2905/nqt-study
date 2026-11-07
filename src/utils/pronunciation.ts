export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakEnglish(word: string) {
  if (!canSpeak()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("en-us"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}
