import { useEffect, useMemo, useRef, useState } from 'react';
import Tts from 'react-native-tts';
import { Platform } from 'react-native';

export function usePageRead(textToRead: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] =
    useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  let osCheck = Platform.OS;

  // Memoize words
  const words = useMemo(
    () => textToRead.trim().split(/\s+/),
    [textToRead]
  );

  const indexRef = useRef(0);
  // Initialize TTS on mount
  useEffect(() => {
    const initTTS = async () => {
      try {
        // iOS specific initialization
        if (osCheck === 'ios') {
          await Tts.setIgnoreSilentSwitch('ignore');
          await Tts.setDucking(true);
        }
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.5);
        await Tts.setDefaultPitch(1.0);
        setIsInitialized(true);
        console.log('TTS initialized in usePageRead for', osCheck);
      } catch (error) {
        console.log('TTS initialization error:', error);
      }
    };
    initTTS();
  }, []);

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
      // Ensure initialization is complete
      if (!isInitialized) {
        console.log('TTS not initialized yet, waiting...');
        return;
      }

      indexRef.current = 0;
      setCurrentWordIndex(0);
      setIsSpeaking(true);

      await Tts.stop();
      await Tts.speak(words[0]);
    },

    pause: async () => {
      if (osCheck === 'ios') {
        await Tts.pause();
      } else {
        await Tts.stop();
      }
      setIsSpeaking(false);
    },

    resume: async () => {
      if (indexRef.current < words.length) {
        if (osCheck === 'ios') {
          await Tts.resume();
        } else {
          await Tts.stop();
        }
        setIsSpeaking(true);
        await Tts.speak(words[indexRef.current]);
      }
    },

    stop: async () => {
      if (osCheck === 'ios') {
        await Tts.pause();
      } else {
        await Tts.stop();
      }
      indexRef.current = 0;
      setIsSpeaking(false);
      setCurrentWordIndex(null);
    },
  }), [isSpeaking, currentWordIndex, words, isInitialized]);
}
