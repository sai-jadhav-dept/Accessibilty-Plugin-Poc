import React from 'react';
import { AccessibilityProvider } from './AccessibilityContext';
import AccessibilityColorWrapper from './AccessibilityColorWrapper';

const AccessibilityRoot = ({ children, style }) => {
  return (
    <AccessibilityProvider>
      <AccessibilityColorWrapper style={style}>{children}</AccessibilityColorWrapper>
    </AccessibilityProvider>
  );
};

export default AccessibilityRoot;
