import React from 'react';
import { TouchableOpacity, Pressable } from 'react-native';
import Global from '../screens/Global';

/**
 * EnlargedTouchable - HOC that enlarges touch targets for accessibility
 * Wraps TouchableOpacity or Pressable and increases size when enlargeButtons is enabled
 */
const EnlargedTouchable = ({ children, style, component: Component = TouchableOpacity, ...props }) => {
  const enlargeButtons = Global.accessibility?.enlargeButtons || false;
  const sizeMultiplier = enlargeButtons ? 1.3 : 1;

  const enhancedStyle = Array.isArray(style) ? style : [style];
  const enlargedStyle = enlargeButtons ? {
    minHeight: 48 * sizeMultiplier,
    minWidth: 48 * sizeMultiplier,
    paddingVertical: (enhancedStyle[0]?.paddingVertical || 8) * sizeMultiplier,
    paddingHorizontal: (enhancedStyle[0]?.paddingHorizontal || 8) * sizeMultiplier,
  } : {};

  return (
    <Component {...props} style={[...enhancedStyle, enlargedStyle]}>
      {children}
    </Component>
  );
};

export default EnlargedTouchable;
