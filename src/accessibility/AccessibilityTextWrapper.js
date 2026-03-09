import React from 'react';
import { useAccessibility } from './AccessibilityContext';
import DictionaryLookup from './DictionaryLookup';
import TextMagnifier from './TextMagnifier';

const AccessibilityTextWrapper = ({
  children,
  dictionaryEnabled,
  textMagnifierEnabled,
}) => {
  const { dictionary, textMagnifier } = useAccessibility();

  return (
    <DictionaryLookup enabled={dictionaryEnabled ?? dictionary}>
      <TextMagnifier enabled={textMagnifierEnabled ?? textMagnifier}>
        {children}
      </TextMagnifier>
    </DictionaryLookup>
  );
};

export default AccessibilityTextWrapper;