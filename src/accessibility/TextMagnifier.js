import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

const TextMagnifier = ({ children, enabled, textStyle }) => {
  const [pan] = useState(new Animated.ValueXY());
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const textContainerRef = useRef(null);
  const magnificationFactor = 2;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => enabled,
    onPanResponderGrant: (evt) => {
      const pageX = evt.nativeEvent.pageX;
      const pageY = evt.nativeEvent.pageY;
      
      textContainerRef.current?.measure((fx, fy, width, height, px, py) => {
        const touchX = pageX - px;
        const touchY = pageY - py;
        setTouchPosition({ x: touchX, y: touchY });
        setShowMagnifier(true);
      });
    },
    onPanResponderMove: (evt, gestureState) => {
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
    },
    onPanResponderRelease: () => {
      setShowMagnifier(false);
      pan.setValue({ x: 0, y: 0 });
    },
  });

  if (!enabled) {
    return <View>{children}</View>;
  }

  return (
    <View style={{ position: 'relative' }}>
      <View 
        ref={textContainerRef}
        {...panResponder.panHandlers}
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
