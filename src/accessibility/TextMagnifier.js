import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

const TextMagnifier = ({ children, enabled, textStyle }) => {
  const [pan] = useState(new Animated.ValueXY());
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const textContainerRef = useRef(null);
  const magnificationFactor = 2;
  const activationTimer = useRef(null);
  const initialTouch = useRef({ x: 0, y: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only capture if user holds still (minimal movement) - likely wants magnifier
      if (enabled && Math.abs(gestureState.dy) < 10) {
        return true;
      }
      return false;
    },
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderTerminationRequest: () => true, // Allow ScrollView to take over
    onPanResponderGrant: (evt) => {
      if (!enabled) return;
      
      const pageX = evt.nativeEvent.pageX;
      const pageY = evt.nativeEvent.pageY;
      initialTouch.current = { x: pageX, y: pageY };
      
      // Set timer to activate magnifier after 300ms
      activationTimer.current = setTimeout(() => {
        textContainerRef.current?.measure((fx, fy, width, height, px, py) => {
          const touchX = pageX - px;
          const touchY = pageY - py;
          setTouchPosition({ x: touchX, y: touchY });
          setShowMagnifier(true);
        });
      }, 300);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!enabled) return;
      
      // If user moves too much vertically, cancel magnifier (they're scrolling)
      if (Math.abs(gestureState.dy) > 10 && activationTimer.current) {
        clearTimeout(activationTimer.current);
        activationTimer.current = null;
        return;
      }
      
      // Only update position if magnifier is showing
      if (showMagnifier) {
        const pageX = evt.nativeEvent.pageX;
        const pageY = evt.nativeEvent.pageY;
        
        textContainerRef.current?.measure((fx, fy, width, height, px, py) => {
          const touchX = pageX - px;
          const touchY = pageY - py;
          setTouchPosition({ x: touchX, y: touchY });
        });
        Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        )(evt, gestureState);
      }
    },
    onPanResponderRelease: () => {
      if (activationTimer.current) {
        clearTimeout(activationTimer.current);
        activationTimer.current = null;
      }
      setShowMagnifier(false);
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderTerminate: () => {
      if (activationTimer.current) {
        clearTimeout(activationTimer.current);
        activationTimer.current = null;
      }
      setShowMagnifier(false);
      pan.setValue({ x: 0, y: 0 });
    },
  });

  if (!enabled) {
    return <View>{children}</View>;
  }

  return (
    <View style={{ position: 'relative' }} collapsable={false}>
      <View 
        ref={textContainerRef}
        {...panResponder.panHandlers}
        collapsable={false}
        pointerEvents="auto"
      >
        {children}
      </View>

      {showMagnifier && (
        <Animated.View
          style={[
            styles.magnifier,
            {
              transform: [
                { translateX: Animated.add(pan.x, -60 + touchPosition.x) },
                { translateY: Animated.add(pan.y, -120 + touchPosition.y) },
              ],
            },
          ]}
        >
          <View 
            style={[
              styles.innerMagnifier,
              {
                left: -(touchPosition.x * magnificationFactor - 60),
                top: -(touchPosition.y * magnificationFactor - 60),
              }
            ]}
          >
            {React.cloneElement(children, {
              style: [
                children.props.style,
                textStyle,
                styles.magnifiedText,
              ]
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  magnifier: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    overflow: 'hidden',
    zIndex: 100,
  },
  innerMagnifier: {
    width: 500,
    position: 'absolute',
    padding: 10,
  },
  magnifiedText: {
    fontSize: 32,
    lineHeight: 48,
  },
});

export default TextMagnifier;
