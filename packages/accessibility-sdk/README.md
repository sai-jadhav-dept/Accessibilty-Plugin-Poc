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
  AccessibilityRoot,
  AccessibilityButton,
  AccessibilityModal,
  A11yText,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function App() {
  return (
    <AccessibilityRoot>
      <View style={{ flex: 1, padding: 16 }}>
        <A11yText baseFontSize={16}>This text responds to accessibility settings.</A11yText>
        <AccessibilityButton />
        <AccessibilityModal />
      </View>
    </AccessibilityRoot>
  );
}
```

Use `AccessibilityRoot` once at app root. You do not need to wrap every page/screen.

## React Native Implementation Playbook

Use this section when you want exact placement guidance for code in a real app.

### Step 1. App root setup (`App.tsx`)

```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  AccessibilityRoot,
  AccessibilityButton,
  AccessibilityModal,
  ReadModal,
  useAccessibility,
} from '@teknopoint-mobile-team/accessibility-sdk';
import RootNavigator from './src/navigation/RootNavigator';

function ReaderOverlay() {
  const { textToSpeech } = useAccessibility();
  return <ReadModal activeModal={textToSpeech} />;
}

export default function App() {
  return (
    <AccessibilityRoot>
      <NavigationContainer>
        <RootNavigator />
        <AccessibilityButton />
        <AccessibilityModal />
        <ReaderOverlay />
      </NavigationContainer>
    </AccessibilityRoot>
  );
}
```

`ReadModal` should be mounted once at app root (not in each screen), so it works globally across all pages.

### Step 2. Accessible text in screens (`src/screens/HomeScreen.tsx`)

```jsx
import React from 'react';
import { View } from 'react-native';
import { A11yText, useDynamicColors } from '@teknopoint-mobile-team/accessibility-sdk';

export default function HomeScreen() {
  const colors = useDynamicColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.defaultBackground, padding: 16 }}>
      <A11yText baseFontSize={22} style={{ fontWeight: '700' }}>Welcome</A11yText>
      <A11yText baseFontSize={16} style={{ marginTop: 8 }}>
        This paragraph respects font scaling, spacing, line height, and alignment.
      </A11yText>
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
  A11yText,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function ArticleCard() {
  return (
    <View>
      <AccessibleImage
        source={{ uri: 'https://picsum.photos/300/160' }}
        style={{ width: 300, height: 160, borderRadius: 8 }}
        alt="Doctor checking patient reports"
      />
      <AccessibleImage
        source={{ uri: 'https://picsum.photos/300/160?2' }}
        style={{ width: 300, height: 160, marginTop: 12, borderRadius: 8 }}
        alt="Hospital reception area"
      />
      <A11yText baseFontSize={14} style={{ marginTop: 8 }}>
        Image descriptions and filters are controlled by accessibility state.
      </A11yText>
    </View>
  );
}
```

### Step 5. Reading support (`src/screens/ArticleDetailScreen.tsx`)

```jsx
import React from 'react';
import { ScrollView } from 'react-native';
import {
  AccessibilityScreenWrapper,
  A11yText,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function ArticleDetailScreen() {
  return (
    <AccessibilityScreenWrapper>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <A11yText baseFontSize={16} style={{ lineHeight: 26 }}>
          Long article content...
        </A11yText>
      </ScrollView>
    </AccessibilityScreenWrapper>
  );
}
```

If your screen already has a top-level reading wrapper, keep only text tools:

```jsx
import { Text } from 'react-native';
import { AccessibilityTextWrapper } from '@teknopoint-mobile-team/accessibility-sdk';

<AccessibilityTextWrapper>
  <Text>Section text...</Text>
</AccessibilityTextWrapper>
```

### A11yText props (what to pass)

Use `A11yText` as the default text component. For most cases, these are the only props you need.

- `children` (required): text content.
- `baseFontSize` (recommended): base size before accessibility scaling. Default is `14`.
- `style` (optional): your custom text styles.
- `dictionaryEnabled` (optional): override dictionary lookup for this text only.
  - `true`: force enable
  - omitted: follow global setting from `AccessibilityProvider`
- `textMagnifierEnabled` (optional): override text magnifier for this text only.
  - `true`: force enable
  - omitted: follow global setting from `AccessibilityProvider`

All other React Native `Text` props are also supported and passed through, for example:
- `numberOfLines`
- `ellipsizeMode`
- `onPress`
- `accessibilityLabel`
- `accessibilityHint`

Recommended usage (global settings control dictionary + magnifier):

```jsx
<A11yText baseFontSize={16} style={{ marginTop: 8 }}>
  This text automatically follows font scaling, spacing, alignment, dictionary, and magnifier settings.
</A11yText>
```

Per-text usage with all features enabled:

```jsx
<A11yText
  baseFontSize={18}
  dictionaryEnabled={true}
  textMagnifierEnabled={true}
>
  This paragraph enables dictionary and magnifier explicitly.
</A11yText>
```

Note: for best dictionary word-tap behavior, keep `children` as plain text (string content) inside `A11yText`.

### How `pageReadText` works with `A11yText`

`pageReadText` is not a prop of `A11yText`.

`A11yText` handles text accessibility features (scaling, dictionary, magnifier), while `ReadModal` reads from SDK runtime text (`pageReadText`).

Flow:
- User taps a paragraph (`onPress` on `A11yText`)
- You set runtime text (`pageReadText`)
- `ReadModal` picks that text and reads it when TTS is enabled

Recommended SDK usage:

```jsx
import { A11yText, setRuntime } from '@teknopoint-mobile-team/accessibility-sdk';

<A11yText
  baseFontSize={16}
  onPress={() => {
    setRuntime({
      pageReadText: 'Manage treatments with ease, on one platform',
    });
  }}
>
  Manage treatments with ease, on one platform
</A11yText>
```

If you are inside this repository's app code, you may also see legacy direct runtime assignment like `Global.pageReadText = '...'`.

### Step 6. TTS reader modal (`src/components/ReaderOverlay.tsx`)

```jsx
import React from 'react';
import { ReadModal, useAccessibility } from '@teknopoint-mobile-team/accessibility-sdk';

export default function ReaderOverlay() {
  const { textToSpeech } = useAccessibility();
  return <ReadModal activeModal={textToSpeech} />;
}
```

Then mount this once in `App.tsx` near `AccessibilityButton` and `AccessibilityModal`.

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
- `AccessibilityRoot`: one-step app wrapper (`AccessibilityProvider` + `AccessibilityColorWrapper`)
- `AccessibilityColorWrapper`: theme/filter wrapper
- `AccessibilityScreenWrapper`: one-step page wrapper (`ReadingGuide`)
- `AccessibilityTextWrapper`: one-step text-interaction wrapper (`DictionaryLookup` + `TextMagnifier`)
- `A11yText`: easiest one-tag text component (`AccessibleText` + `DictionaryLookup` + `TextMagnifier`)
- `AccessibleTextPlus`: alias for `A11yText`
- `InteractiveAccessibleText`: backward-compatible alias for `A11yText`
- `AccessibilityReadingWrapper`: backward-compatible alias (`AccessibilityScreenWrapper` + `AccessibilityTextWrapper`)
- `AccessibleText`: low-level base text component (typography scaling/spacing/alignment only)
- `AccessibleButton`: enlarged touch targets + reduced motion behavior
- `AccessibleImage`: single image component (hide images + alt tooltip + color filters)
- `FilteredImage`: accessibility color filters
- `AccessibleFilteredImage`: backward-compatible alias of `AccessibleImage`
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
- Confirm app root is wrapped with `AccessibilityRoot` (or `AccessibilityProvider` + `AccessibilityColorWrapper`).

## Publish

See `PUBLISHING.md` for private package publishing with GitHub Packages.
