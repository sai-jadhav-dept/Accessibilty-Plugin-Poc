import { useEffect, useMemo, useRef, useState } from 'react';
import Tts from 'react-native-tts';

export function usePageRead(textToRead: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] =
    useState<number | null>(null);

  // Memoize words
  const words = useMemo(
    () => textToRead.trim().split(/\s+/),
    [textToRead]
  );

  const indexRef = useRef(0);

  useEffect(() => {
    const finishSub = Tts.addEventListener('tts-finish', () => {
      indexRef.current += 1;

      if (indexRef.current < words.length) {
        setCurrentWordIndex(indexRef.current);
        Tts.speak(words[indexRef.current]);
      } else {
        setIsSpeaking(false);
        setCurrentWordIndex(null);
      }
    });

    const cancelSub = Tts.addEventListener('tts-cancel', () => {
      setIsSpeaking(false);
    });

    return () => {
      (finishSub as any)?.remove?.();
      (cancelSub as any)?.remove?.();
    };
  }, [words]);

  // ✅ return wrapped in useMemo (as requested)
  return useMemo(() => ({
    isSpeaking,
    currentWordIndex,
    words,

    start: async () => {
      if (!words.length) return;

      indexRef.current = 0;
      setCurrentWordIndex(0);
      setIsSpeaking(true);

      await Tts.stop();
      await Tts.speak(words[0]);
    },

    pause: async () => {
      await Tts.stop();
      setIsSpeaking(false);
    },

    resume: async () => {
      if (indexRef.current < words.length) {
        setIsSpeaking(true);
        await Tts.speak(words[indexRef.current]);
      }
    },

    stop: async () => {
      await Tts.stop();
      indexRef.current = 0;
      setIsSpeaking(false);
      setCurrentWordIndex(null);
    },
  }), [isSpeaking, currentWordIndex, words]);
}
