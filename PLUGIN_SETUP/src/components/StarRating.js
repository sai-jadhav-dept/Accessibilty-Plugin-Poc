import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthToDp } from '../utils/Responsive';

const STAR_ICON = 'star';
const STAR_EMPTY_ICON = 'star-o';
const STAR_HALF_ICON = 'star-half-o';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: widthToDp(70),
    alignSelf: "center",
    justifyContent: "center"
  },
  starIcon: {
    marginRight: 5
  }
});

const StarRating = ({ initialRating = 0, onChange }) => {
  const [rating, setRating] = useState(initialRating);
  const [starHovered, setStarHovered] = useState(null);

  const containerRef = useRef(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const ratingPerStar = 1 / 10;
        const x = gestureState.moveX;
        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        const starWidth = containerWidth / 5;
        const starRating = Math.round(x / starWidth / ratingPerStar * 2) / 2;
        setRating(Math.max(0, Math.min(5, starRating)));
      },
      onPanResponderRelease: () => { console.log("on pan responder release") },
    })
  ).current;

  const handleStarPress = (ratingValue) => {
    if (ratingValue === rating) {
      setRating(rating - 1);
      onChange(0);
    } else {
      setRating(ratingValue);
      onChange(ratingValue);
    }
  };


  const handleStarHover = (star) => {
    setStarHovered(star);
  };

  const handleStarHoverEnd = () => {
    setStarHovered(null);
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      let starIcon = STAR_EMPTY_ICON;

      if (i < Math.floor(rating)) {
        starIcon = STAR_ICON;
      } else if (i === Math.floor(rating) && rating % 1 !== 0) {
        starIcon = STAR_HALF_ICON;
      }

      if (starHovered !== null) {
        if (i < Math.floor(starHovered)) {
          starIcon = STAR_ICON;
        } else if (i === Math.floor(starHovered) && starHovered % 1 !== 0) {
          starIcon = STAR_HALF_ICON;
        }
      }
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i + 1)}
          onPressIn={() => handleStarHover(i + 1)}
          onPressOut={() => handleStarHoverEnd()}
        >
          <Icon
            name={starIcon}
            size={55}
            color={"gold"}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  return (
    <View
      ref={containerRef}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {renderStars()}
    </View>
  );
};

export default StarRating;
