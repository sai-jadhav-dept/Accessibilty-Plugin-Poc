import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_ACCESSIBILITY_STATE, applyProfile } from './AccessibilityUtils';
import { loadAccessibilityPreferences, saveAccessibilityPreferences } from './AccessibilityStorage';
import NativeAccessibilityBridge from './NativeAccessibilityBridge';
import Global from './AccessibilityRuntime';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULT_ACCESSIBILITY_STATE);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentReadingText, setCurrentReadingText] = useState(null);

  // Initialize native accessibility detection
  useEffect(() => {
    const initNative = async () => {
      await NativeAccessibilityBridge.initialize((nativeSettings) => {
        setState(prevState => ({
          ...prevState,
          ...nativeSettings,
        }));
      });
    };

    initNative();

    return () => {
      NativeAccessibilityBridge.cleanup();
    };
  }, []);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const preferences = await loadAccessibilityPreferences();
      setState(preferences);
      setIsLoading(false);
    };

    loadPreferences();
  }, []);

  // Save preferences whenever state changes
  useEffect(() => {
    if (!isLoading) {
      saveAccessibilityPreferences(state);
      
      // Sync with Global.accessibility for components that use Global
      Global.accessibility = {
        ...Global.accessibility,
        pageRead: state.textToSpeech,
        imageDescription: state.imageDescription,
        textMagnifier: state.textMagnifier,
        dictionary: state.dictionary,
        readingMask: state.readingMask,
        readingLine: state.readingLine,
        enlargeButtons: state.enlargeButtons,
        reducedMotion: state.reducedMotion,
        highlightLinks: state.highlightLinks,
        textAlignment: state.textAlignment,
      };
    }
  }, [state, isLoading]);

  // Update individual setting
  const updateSetting = useCallback((key, value) => {
    setState(prevState => ({
      ...prevState,
      [key]: value,
      activeProfile: 'none',
    }));
  }, []);

  // Update multiple settings
  const updateSettings = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...updates,
    }));
  }, []);

  // Apply profile
  const setProfile = useCallback((profile) => {
    const profileSettings = applyProfile(profile);
    setState(profileSettings);
  }, []);

  // Reset defaults
  const resetToDefault = useCallback(() => {
    setState(DEFAULT_ACCESSIBILITY_STATE);
  }, []);

  // Modal controls
  const toggleModal = useCallback(() => {
    setIsModalVisible(prev => !prev);
  }, []);

  const openModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Screen reader announce
  const announce = useCallback((message, options) => {
    NativeAccessibilityBridge.announce(message, options);
  }, []);

  // Track current reading text
  const setReadingText = useCallback((text) => {
    setCurrentReadingText(text);
  }, []);

  const clearReadingText = useCallback(() => {
    setCurrentReadingText(null);
  }, []);

  const value = useMemo(() => ({
    ...state,
    isModalVisible,
    isLoading,
    currentReadingText,

    updateSetting,
    updateSettings,
    setProfile,
    resetToDefault,
    toggleModal,
    openModal,
    closeModal,
    announce,
    setReadingText,
    clearReadingText,
  }), [
    state,
    isModalVisible,
    isLoading,
    currentReadingText,
    updateSetting,
    updateSettings,
    setProfile,
    resetToDefault,
    toggleModal,
    openModal,
    closeModal,
    announce,
    setReadingText,
    clearReadingText,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;
