import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Platform } from 'react-native';

const TextMagnifier = ({ children, enabled, textStyle }) => {
  const [pan] = useState(new Animated.ValueXY());
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const textContainerRef = useRef(null);
  const magnificationFactor = 2;
  const activationTimer = useRef(null);
  const initialTouch = useRef({ x: 0, y: 0 });
  const isLongPress = useRef(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => enabled && Platform.OS === 'ios',
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // On iOS, be more lenient with movement detection
      const movementThreshold = Platform.OS === 'ios' ? 15 : 10;
      // Only capture if user holds still (minimal movement) - likely wants magnifier
      if (enabled && Math.abs(gestureState.dy) < movementThreshold && Math.abs(gestureState.dx) < movementThreshold) {
        return true;
      }
      return false;
    },
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderTerminationRequest: () => !showMagnifier, // Don't allow termination while magnifier is showing
    onPanResponderGrant: (evt) => {
      if (!enabled) return;
      isLongPress.current = false;
      
      const pageX = evt.nativeEvent.pageX;
      const pageY = evt.nativeEvent.pageY;
      initialTouch.current = { x: pageX, y: pageY };
      
      // Set timer to activate magnifier - shorter delay for iOS
      const delay = Platform.OS === 'ios' ? 200 : 300;
      activationTimer.current = setTimeout(() => {
        isLongPress.current = true;
        if (textContainerRef.current) {
          textContainerRef.current.measure((fx, fy, width, height, px, py) => {
            const touchX = pageX - px;
            const touchY = pageY - py;
            setTouchPosition({ x: touchX, y: touchY });
            setShowMagnifier(true);
          });
        }
      }, delay);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!enabled) return;
      
      // If user moves too much, cancel magnifier (they're scrolling)
      const movementThreshold = Platform.OS === 'ios' ? 15 : 10;
      if ((Math.abs(gestureState.dy) > movementThreshold || Math.abs(gestureState.dx) > movementThreshold) && 
          !isLongPress.current && activationTimer.current) {
        clearTimeout(activationTimer.current);
        activationTimer.current = null;
        return;
      }
      
      // Only update position if magnifier is showing
      if (showMagnifier) {
        const pageX = evt.nativeEvent.pageX;
        const pageY = evt.nativeEvent.pageY;
        
        if (textContainerRef.current) {
          textContainerRef.current.measure((fx, fy, width, height, px, py) => {
            const touchX = pageX - px;
            const touchY = pageY - py;
            setTouchPosition({ x: touchX, y: touchY });
          });
        }
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
      isLongPress.current = false;
      setShowMagnifier(false);
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderTerminate: () => {
      if (activationTimer.current) {
        clearTimeout(activationTimer.current);
        activationTimer.current = null;
      }
      isLongPress.current = false;
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
        pointerEvents="box-none"
      >
        {children}
      </View>

      {showMagnifier && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.magnifier,
            Platform.OS === 'ios' && styles.magnifierIOS,
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
    elevation: 10,
  },
  magnifierIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
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
