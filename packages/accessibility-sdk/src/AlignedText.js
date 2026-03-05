import React from 'react';
import { Text } from 'react-native';
import Global from './AccessibilityRuntime';

/**
 * AlignedText - Component that applies text alignment from accessibility settings
 * Wraps Text component and applies alignment based on Global.accessibility.textAlignment
 */
const AlignedText = ({ children, style, ...props }) => {
  const textAlignment = Global.accessibility?.textAlignment || 'left';
  
  const alignmentStyle = {
    textAlign: textAlignment,
  };

  return (
    <Text {...props} style={[style, alignmentStyle]}>
      {children}
    </Text>
  );
};

export default AlignedText;
