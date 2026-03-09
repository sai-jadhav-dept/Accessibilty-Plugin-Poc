# Accessibility SDK

Reusable React Native accessibility components, hooks, and services extracted from the `AccessibilityPlugin` project.

## Install

```bash
npm install @teknopoint-mobile-team/accessibility-sdk
```

## Peer Dependencies

```bash
npm install @react-native-community/slider @react-native-async-storage/async-storage @miblanchard/react-native-slider react-native-color-matrix-image-filters react-native-draggable react-native-element-dropdown react-native-safe-area-context react-native-tts react-native-vector-icons
```

## Quick Start

```jsx
import React from 'react';
import { View } from 'react-native';
import {
  AccessibilityProvider,
  AccessibilityButton,
  AccessibilityModal,
  AccessibilityColorWrapper,
  AccessibleText,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function App() {
  return (
    <AccessibilityProvider>
      <AccessibilityColorWrapper>
        <View style={{ flex: 1, padding: 16 }}>
          <AccessibleText baseFontSize={16}>This text responds to accessibility settings.</AccessibleText>
          <AccessibilityButton />
          <AccessibilityModal />
        </View>
      </AccessibilityColorWrapper>
    </AccessibilityProvider>
  );
}
```

## React Native Implementation Playbook

Use this section when you want exact placement guidance for code in a real app.

### Step 1. App root setup (`App.tsx`)

```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  AccessibilityProvider,
  AccessibilityColorWrapper,
  AccessibilityButton,
  AccessibilityModal,
} from '@teknopoint-mobile-team/accessibility-sdk';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AccessibilityProvider>
      <AccessibilityColorWrapper>
        <NavigationContainer>
          <RootNavigator />
          <AccessibilityButton />
          <AccessibilityModal />
        </NavigationContainer>
      </AccessibilityColorWrapper>
    </AccessibilityProvider>
  );
}
```

### Step 2. Accessible text in screens (`src/screens/HomeScreen.tsx`)

```jsx
import React from 'react';
import { View } from 'react-native';
import { AccessibleText, useDynamicColors } from '@teknopoint-mobile-team/accessibility-sdk';

export default function HomeScreen() {
  const colors = useDynamicColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.defaultBackground, padding: 16 }}>
      <AccessibleText baseFontSize={22} style={{ fontWeight: '700' }}>Welcome</AccessibleText>
      <AccessibleText baseFontSize={16} style={{ marginTop: 8 }}>
        This paragraph respects font scaling, spacing, line height, and alignment.
      </AccessibleText>
    </View>
  );
}
```

### Step 3. Accessible tap targets (`src/components/PrimaryActionButton.tsx`)

```jsx
import React from 'react';
import { Text } from 'react-native';
import { AccessibleButton } from '@teknopoint-mobile-team/accessibility-sdk';

export default function PrimaryActionButton({ title, onPress }) {
  return (
    <AccessibleButton
      onPress={onPress}
      accessibilityLabel={title}
      accessibilityHint="Double tap to activate"
      style={{ marginTop: 16 }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>{title}</Text>
    </AccessibleButton>
  );
}
```

### Step 4. Accessible images (`src/components/ArticleCard.tsx`)

```jsx
import React from 'react';
import { View } from 'react-native';
import {
  AccessibleImage,
  AccessibleFilteredImage,
  AccessibleText,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function ArticleCard() {
  return (
    <View>
      <AccessibleImage
        source={{ uri: 'https://picsum.photos/300/160' }}
        style={{ width: 300, height: 160, borderRadius: 8 }}
        alt="Doctor checking patient reports"
      />
      <AccessibleFilteredImage
        source={{ uri: 'https://picsum.photos/300/160?2' }}
        style={{ width: 300, height: 160, marginTop: 12, borderRadius: 8 }}
        alt="Hospital reception area"
      />
      <AccessibleText baseFontSize={14} style={{ marginTop: 8 }}>
        Image descriptions and filters are controlled by accessibility state.
      </AccessibleText>
    </View>
  );
}
```

### Step 5. Reading support (`src/screens/ArticleDetailScreen.tsx`)

```jsx
import React from 'react';
import { ScrollView, Text } from 'react-native';
import {
  DictionaryLookup,
  ReadingGuide,
  TextMagnifier,
  useAccessibility,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function ArticleDetailScreen() {
  const { dictionary, readingMask, readingLine, textMagnifier } = useAccessibility();

  return (
    <ReadingGuide maskEnabled={readingMask} lineEnabled={readingLine}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <DictionaryLookup enabled={dictionary}>
          <TextMagnifier enabled={textMagnifier}>
            <Text style={{ fontSize: 16, lineHeight: 26 }}>Long article content...</Text>
          </TextMagnifier>
        </DictionaryLookup>
      </ScrollView>
    </ReadingGuide>
  );
}
```

### Step 6. TTS reader modal (`src/screens/ReaderOverlay.tsx`)

```jsx
import React from 'react';
import { ReadModal, useAccessibility } from '@teknopoint-mobile-team/accessibility-sdk';

export default function ReaderOverlay() {
  const { textToSpeech } = useAccessibility();
  return <ReadModal activeModal={textToSpeech} />;
}
```

### Step 7. Programmatic toggles (`src/screens/QuickAccessScreen.tsx`)

```jsx
import React from 'react';
import { Button, View } from 'react-native';
import { useAccessibility, ACCESSIBILITY_PROFILES } from '@teknopoint-mobile-team/accessibility-sdk';

export default function QuickAccessScreen() {
  const { setProfile, updateSetting } = useAccessibility();

  return (
    <View style={{ padding: 16 }}>
      <Button title="Enable Low Vision Profile" onPress={() => setProfile(ACCESSIBILITY_PROFILES.LOW_VISION)} />
      <View style={{ height: 12 }} />
      <Button title="Toggle High Contrast" onPress={() => updateSetting('highContrast', true)} />
    </View>
  );
}
```

### Step 8. Optional runtime bridge

Use only if your app still relies on global-style runtime values.

```js
import { setRuntime } from '@teknopoint-mobile-team/accessibility-sdk';

setRuntime({
  pageReadText: 'Text currently visible on the screen',
  accessibility: { textAlignment: 'left' },
});
```

## Architecture

`AccessibilityProvider` is the source of truth. It manages state, merges native settings, and persists preferences in AsyncStorage.

Persistence key:
- `@accessibility_preferences`

Main context methods:
- `updateSetting(key, value)`
- `updateSettings(updates)`
- `setProfile(profile)`
- `resetToDefault()`
- `openModal()`, `closeModal()`, `toggleModal()`
- `announce(message, options)`

## Feature Reference

### Components

- `AccessibilityButton`: floating menu launcher
- `AccessibilityModal`: main settings modal
- `AccessibilityColorWrapper`: theme/filter wrapper
- `AccessibleText`: typography scaling/spacing/alignment
- `AccessibleButton`: enlarged touch targets + reduced motion behavior
- `AccessibleImage`: hide images + alt tooltip support
- `FilteredImage`: accessibility color filters
- `AccessibleFilteredImage`: image accessibility + filters
- `TextMagnifier`: long-press magnifier
- `DictionaryLookup`: tap words for definitions
- `ReadingGuide`: reading mask/line overlay
- `EnlargedTouchable`: touch-target wrapper
- `AlignedText`: alignment helper
- `ReadModal`: draggable TTS reading modal
- `ScreenReaderControls`: voice/rate/pitch controls
- `TextControlsWithSlider`: text controls UI
- `ProfileTester`: profile testing helper

### Hooks

- `useAccessibility`
- `useDynamicColors`
- `useThemeColors`
- `usePageRead`

### Services and Helpers

- `TTSService`
- `NativeAccessibilityBridge`
- `AccessibilityRuntime`
- `setRuntime`
- `Colors`
- `getColors`
- utilities from `AccessibilityUtils`
- storage helpers from `AccessibilityStorage`

## Troubleshooting

`npm install` fails for this package:
- Ensure consuming app `.npmrc` has org registry mapping and token.

TTS is silent on iOS:
- Check silent-switch behavior, iOS audio state, and `react-native-tts` setup.

Modal/button not visible:
- Confirm app root is wrapped with `AccessibilityProvider`.

## Publish

See `PUBLISHING.md` for private package publishing with GitHub Packages.
