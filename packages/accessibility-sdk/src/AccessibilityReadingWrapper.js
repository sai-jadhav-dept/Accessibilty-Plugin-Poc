import React from 'react';
import AccessibilityScreenWrapper from './AccessibilityScreenWrapper';
import AccessibilityTextWrapper from './AccessibilityTextWrapper';

const AccessibilityReadingWrapper = ({
  children,
  includeReadingGuide = true,
  dictionaryEnabled,
  textMagnifierEnabled,
  readingMaskEnabled,
  readingLineEnabled,
}) => {
  const content = (
    <AccessibilityTextWrapper
      dictionaryEnabled={dictionaryEnabled}
      textMagnifierEnabled={textMagnifierEnabled}
    >
      {children}
    </AccessibilityTextWrapper>
  );

  if (!includeReadingGuide) {
    return content;
  }

  return (
    <AccessibilityScreenWrapper
      readingMaskEnabled={readingMaskEnabled}
      readingLineEnabled={readingLineEnabled}
    >
      {content}
    </AccessibilityScreenWrapper>
  );
};

export default AccessibilityReadingWrapper;