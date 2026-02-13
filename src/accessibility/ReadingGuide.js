import React, { useState } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

const ReadingGuide = ({ children, maskEnabled, lineEnabled, maskColor = 'rgba(0, 0, 0, 0.7)', lineColor = '#FFD700' }) => {
  const [linePosition, setLinePosition] = useState(new Animated.Value(100));
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => maskEnabled || lineEnabled,
    onMoveShouldSetPanResponder: () => maskEnabled || lineEnabled,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newY = Math.max(0, gestureState.moveY);
      linePosition.setValue(newY);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  if (!maskEnabled && !lineEnabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      
      {maskEnabled && (
        <>
          {/* Top mask */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.mask,
              {
                backgroundColor: maskColor,
                height: linePosition,
                top: 0,
                zIndex: 1000,
              },
            ]}
          />
          
          {/* Reading window indicator - draggable */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.maskWindow,
              {
                top: linePosition,
                height: 60,
                zIndex: 1001,
              },
            ]}
          />
          
          {/* Bottom mask */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.mask,
              {
                backgroundColor: maskColor,
                top: Animated.add(linePosition, 60), // 60 is the reading window height
                bottom: 0,
                zIndex: 1000,
              },
            ]}
          />
        </>
      )}

      {lineEnabled && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.readingLine,
            {
              top: linePosition,
            },
          ]}
        >
          {/* Single horizontal line guide */}
          <View style={styles.lineBar} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  mask: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  maskWindow: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFD700',
  },
  readingLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#007AFF',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    opacity: 0.8,
  },
  lineBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#343434',
  },
  dragHandle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleBar: {
    width: 20,
    height: 3,
    backgroundColor: '#000',
    marginVertical: 2,
    borderRadius: 2,
  },
});

export default ReadingGuide;
