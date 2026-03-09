import React from 'react';
import { useAccessibility } from './AccessibilityContext';
import ReadingGuide from './ReadingGuide';

const AccessibilityScreenWrapper = ({
  children,
  readingMaskEnabled,
  readingLineEnabled,
}) => {
  const { readingMask, readingLine } = useAccessibility();

  return (
    <ReadingGuide
      maskEnabled={readingMaskEnabled ?? readingMask}
      lineEnabled={readingLineEnabled ?? readingLine}
    >
      {children}
    </ReadingGuide>
  );
};

export default AccessibilityScreenWrapper;