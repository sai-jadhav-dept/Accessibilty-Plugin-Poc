/**
 * TTSService.js
 * Text-to-Speech service for reading page content
 */

import { Platform } from 'react-native';
import Tts from 'react-native-tts';

class TTSService {
  isSpeaking = false;
  isPaused = false;
  isInitialized = false;

  /**
   * Initialize TTS
   */
  async init() {
    if (this.isInitialized) {
      return;
    }
    
    try {
      // iOS specific initialization
      if (Platform.OS === 'ios') {
        // Set audio category for iOS to ensure audio plays
        try {
          await Tts.setDucking(true);
          await Tts.setIgnoreSilentSwitch('ignore');
        } catch (iosError) {
          console.log('iOS audio setup warning:', iosError);
        }
      } else if (Platform.OS === 'android') {
        // Android needs a small delay to ensure TTS engine is ready
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Set up event listeners
      Tts.addEventListener('tts-start', () => {
        this.isSpeaking = true;
      });
      
      Tts.addEventListener('tts-finish', () => {
        this.isSpeaking = false;
      });
      
      Tts.addEventListener('tts-cancel', () => {
        this.isSpeaking = false;
      });

      // Set default settings
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);
      
      this.isInitialized = true;
      console.log('TTS initialized successfully for', Platform.OS);
    } catch (error) {
      console.error('TTS Init Error:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Speak text aloud
   */
  async speak(text, options = {}) {
    const {
      language = 'en-US',
      pitch = 1.0,
      rate = 0.5,
    } = options;

    try {
      // Ensure TTS is initialized
      if (!this.isInitialized) {
        await this.init();
        // Add delay on Android to ensure TTS engine is ready
        if (Platform.OS === 'android') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      this.isSpeaking = true;
      this.isPaused = false;

      await Tts.setDefaultLanguage(language);
      await Tts.setDefaultRate(rate);
      await Tts.setDefaultPitch(pitch);
      
      // Ensure text is not empty
      if (!text || text.trim().length === 0) {
        console.warn('TTS: Empty text provided');
        this.isSpeaking = false;
        return;
      }
      
      Tts.speak(text);
    } catch (error) {
      this.isSpeaking = false;
      console.error('TTS Error:', error);
      throw error;
    }
  }

  /**
   * Stop speaking
   */
  stop() {
    Tts.stop();
    this.isSpeaking = false;
    this.isPaused = false;
  }

  /**
   * Check if TTS is available
   */
  async isAvailable() {
    try {
      const voices = await Tts.voices();
      return voices && voices.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    try {
      return await Tts.voices();
    } catch (error) {
      return [];
    }
  }

  /**
   * Read entire page (utility function)
   * Extracts text from components marked with accessibility labels
   */
  readPage(textContent) {
    if (!textContent) return;
    
    // Clean and prepare text for reading
    const cleanText = textContent
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim();
    
    this.speak(cleanText, {
      rate: 0.9, // Slightly slower for better comprehension
    });
  }
}

export default new TTSService();
