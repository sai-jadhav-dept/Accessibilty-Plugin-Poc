import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';

const ComingSoon = () => {
  return (
        <View style={styles.container}>
          <Text style={[Fonts.Nunito_700Bold, GlobalStyles.extralargeText]}>COMING SOON !</Text>
        </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14
  },

});

export default ComingSoon;