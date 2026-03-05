# Accessibility SDK

Reusable React Native accessibility components, hooks, and services extracted from the `AccessibilityPlugin` project.

## Install

```bash
npm install @teknopoint-mobile-team/accessibility-sdk
```

## Required peer dependencies

Install peer dependencies in the consuming app:

```bash
npm install @react-native-async-storage/async-storage @miblanchard/react-native-slider react-native-color-matrix-image-filters react-native-draggable react-native-element-dropdown react-native-safe-area-context react-native-tts react-native-vector-icons
```

## Basic usage

```jsx
import React from 'react';
import { View } from 'react-native';
import {
  AccessibilityProvider,
  AccessibilityButton,
  AccessibilityModal,
  AccessibleText
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function App() {
  return (
    <AccessibilityProvider>
      <View style={{ flex: 1 }}>
        <AccessibleText>Accessible content</AccessibleText>
        <AccessibilityButton />
        <AccessibilityModal />
      </View>
    </AccessibilityProvider>
  );
}
```

## Runtime bridge configuration

This SDK includes a lightweight runtime object used by some components.

```js
import { setRuntime } from '@teknopoint-mobile-team/accessibility-sdk';

setRuntime({
  fontScale: 1,
  pageReadText: 'Your screen text',
  accessibility: {
    textAlignment: 'left',
    pageRead: false
  }
});
```

## Exports

- Components: `AccessibilityButton`, `AccessibilityModal`, `AccessibleText`, `AccessibleImage`, `AccessibleFilteredImage`, `AlignedText`, `EnlargedTouchable`, `TextMagnifier`, `ReadingGuide`, `ReadModal`, `ScreenReaderControls`, `TextControlsWithSlider`, `ProfileTester`, `FilteredImage`
- Context/hooks: `AccessibilityProvider`, `useAccessibility`, `useDynamicColors`, `useThemeColors`, `usePageRead`
- Utilities/services: `TTSService`, `NativeAccessibilityBridge`, `setRuntime`, `AccessibilityRuntime`, `Colors`, `getColors`

## Publish

See `PUBLISHING.md` for private package publishing with GitHub Packages.
