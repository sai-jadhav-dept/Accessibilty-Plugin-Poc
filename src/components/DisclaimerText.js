import React from 'react';
import { Text, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';

const DisclaimerText = ({ text }) => {
  const paragraphs = text.split('\n\n');
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.DisclaimerContent]} key={index}>
          {paragraph}
          {index !== paragraphs.length - 1 && (
            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.DisclaimerContent]}>{'\n\n'}</Text>
          )}
        </Text>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  DisclaimerContent: {
    color: Colors.placeholderTextColor,
    textAlign: "justify"
  }
});

export default DisclaimerText;