import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AccessibilityProvider, AccessibilityButton, AccessibilityModal } from './src/accessibility';
import AccessibilityColorWrapper from './src/accessibility/AccessibilityColorWrapper';
import Intro from './src/screens/Intro';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <AccessibilityColorWrapper>
          <View style={styles.container}>
            <Intro />
            <AccessibilityButton />
            <AccessibilityModal />
          </View>
        </AccessibilityColorWrapper>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
