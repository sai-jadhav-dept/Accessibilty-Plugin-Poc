# Accessibility SDK

Reusable React Native accessibility components, hooks, and services extracted from the `AccessibilityPlugin` project.

## Install

```bash
npm install @teknopoint-mobile-team/accessibility-sdk
```

## Peer Dependencies

Install peer dependencies in the consuming app:

```bash
npm install @react-native-async-storage/async-storage @miblanchard/react-native-slider react-native-color-matrix-image-filters react-native-draggable react-native-element-dropdown react-native-safe-area-context react-native-tts react-native-vector-icons
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
          <AccessibleText baseFontSize={16}>
            This text responds to accessibility settings.
          </AccessibleText>
          <AccessibilityButton />
          <AccessibilityModal />
        </View>
      </AccessibilityColorWrapper>
    </AccessibilityProvider>
  );
}
```

## Architecture

`AccessibilityProvider` is the source of truth.
It manages state, loads/saves settings to AsyncStorage, and merges native accessibility signals from the device.

State persistence key:
- `@accessibility_preferences`

Core context methods:
- `updateSetting(key, value)`
- `updateSettings(updates)`
- `setProfile(profile)`
- `resetToDefault()`
- `openModal()`, `closeModal()`, `toggleModal()`
- `announce(message, options)`
- `setReadingText(text)`, `clearReadingText()`

## Feature Guide

### 1. Provider and State Management

Use this in app root so every component can access accessibility settings.

```jsx
import { AccessibilityProvider, useAccessibility } from '@teknopoint-mobile-team/accessibility-sdk';

function SettingsToggle() {
  const { highContrast, updateSetting } = useAccessibility();


## React Native Implementation Playbook

Use this section when you want to know exactly where to write code in your app.

### Step 1. Setup at app root

Write this in your app entry file, usually `App.js` or `App.tsx`.

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

### Step 2. Make screen text accessible

Write this inside screen files like `src/screens/HomeScreen.tsx`.

```jsx
import React from 'react';
import { View } from 'react-native';
import {
  AccessibleText,
  useDynamicColors,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function HomeScreen() {
  const colors = useDynamicColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.defaultBackground, padding: 16 }}>
      <AccessibleText baseFontSize={22} style={{ fontWeight: '700' }}>
        Welcome
      </AccessibleText>
      <AccessibleText baseFontSize={16} style={{ marginTop: 8 }}>
        This paragraph now respects font size, line height, spacing, and alignment.
      </AccessibleText>
    </View>
  );
}
```

### Step 3. Make buttons easier to tap

Write this in reusable UI components like `src/components/PrimaryActionButton.tsx`.

```jsx
import React from 'react';
import { Text } from 'react-native';
import { AccessibleButton } from '@teknopoint-mobile-team/accessibility-sdk';

export default function PrimaryActionButton({ onPress, title }) {
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

### Step 4. Add accessible images

Write this where image cards or banners are rendered, for example `src/components/ArticleCard.tsx`.

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
        Image descriptions and filters are now controlled by accessibility state.
      </AccessibleText>
    </View>
  );
}
```

### Step 5. Add reading support to long content

Write this inside article/detail screens like `src/screens/ArticleDetailScreen.tsx`.

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
            <Text style={{ fontSize: 16, lineHeight: 26 }}>
              Long article content goes here. Users can use dictionary, mask/line, and magnifier.
            </Text>
          </TextMagnifier>
        </DictionaryLookup>
      </ScrollView>
    </ReadingGuide>
  );
}
```

### Step 6. Add text-to-speech UI

Write this in your reading screen or global overlay container (example `src/screens/ReaderOverlay.tsx`).

```jsx
import React from 'react';
import { ReadModal, useAccessibility } from '@teknopoint-mobile-team/accessibility-sdk';

export default function ReaderOverlay() {
  const { textToSpeech } = useAccessibility();
  return <ReadModal activeModal={textToSpeech} />;
}
```

### Step 7. Programmatically change settings in app logic

Write this in feature screens where you want one-tap mode toggles, for example `src/screens/QuickAccessScreen.tsx`.

```jsx
import React from 'react';
import { Button, View } from 'react-native';
import {
  useAccessibility,
  ACCESSIBILITY_PROFILES,
} from '@teknopoint-mobile-team/accessibility-sdk';

export default function QuickAccessScreen() {
  const { setProfile, updateSetting } = useAccessibility();

  return (
    <View style={{ padding: 16 }}>
      <Button
        title="Enable Low Vision Profile"
        onPress={() => setProfile(ACCESSIBILITY_PROFILES.LOW_VISION)}
      />
      <View style={{ height: 12 }} />
      <Button
        title="Toggle High Contrast"
        onPress={() => updateSetting('highContrast', true)}
      />
    </View>
  );
}
```

### Step 8. Persist and restore custom flows

If you need direct storage helpers in special cases (migrations/import-export), write this in a service file like `src/services/accessibilityStorage.ts`.

```ts
import {
  loadAccessibilityPreferences,
  saveAccessibilityPreferences,
} from '@teknopoint-mobile-team/accessibility-sdk';

export async function backupAccessibilitySettings() {
  const preferences = await loadAccessibilityPreferences();
  return JSON.stringify(preferences);
}

export async function restoreAccessibilitySettings(json: string) {
  const parsed = JSON.parse(json);
  await saveAccessibilityPreferences(parsed);
}
```

### Step 9. Compatibility runtime bridge (optional)

Only use this if your app still relies on global runtime values.
Write this in screen entry points before opening `ReadModal`.

```js
import { setRuntime } from '@teknopoint-mobile-team/accessibility-sdk';

setRuntime({
  pageReadText: 'Text currently visible on the screen',
  accessibility: {
    textAlignment: 'left',
  },
});
```

### Step 10. Minimum files checklist for a new app

Add in `App.tsx`:
- `AccessibilityProvider`
- `AccessibilityColorWrapper`
- `AccessibilityButton`
- `AccessibilityModal`

Use in screens/components:
- `AccessibleText` for readable text scaling
- `AccessibleButton` or `EnlargedTouchable` for touch targets
- `AccessibleImage`/`AccessibleFilteredImage` for image accessibility
- `DictionaryLookup` + `TextMagnifier` + `ReadingGuide` for reading support
- `ReadModal` when TTS/page-read is required

  return (
    <Button
      title={highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
      onPress={() => updateSetting('highContrast', !highContrast)}
    />
  );
}
```

### 2. Floating Menu and Main Modal

Use the floating launcher and modal together.

`AccessibilityButton`:
- Floating action button
- Auto-hides while modal is open
- Enlarges itself when `enlargeButtons` is enabled

`AccessibilityModal`:
- Main control surface for text, color, profile, and navigation settings
- Writes changes into provider state

```jsx
<AccessibilityButton />
<AccessibilityModal />
```

### 3. Text Accessibility

`AccessibleText` props:
- `baseFontSize` (default `14`)
- `style`, `children`, and all regular RN `Text` props

Behavior:
- Applies `fontScale`, `lineHeight`, `letterSpacing`, `textAlignment`
- Applies context `textColor` when set
- Applies bold text when native bold setting is on

```jsx
<AccessibleText baseFontSize={18} style={{ marginBottom: 12 }}>
  Adjustable typography with context-driven scaling.
</AccessibleText>
```

`TextControlsWithSlider`:
- UI block for adjusting bigger text, line height, and letter spacing

```jsx
<TextControlsWithSlider />
```

`AlignedText`:
- Reads alignment from runtime bridge and applies `textAlign`

```jsx
<AlignedText style={{ fontSize: 16 }}>Aligned using current accessibility alignment.</AlignedText>
```

### 4. Touch Target Accessibility

`AccessibleButton` props:
- `basePadding` (default `12`)
- `disabled`, `onPress`, `accessibilityLabel`, `accessibilityHint`
- `style`, `children`

Behavior:
- Expands minimum touch area based on `enlargeButtons`
- Honors reduced motion by changing touch opacity behavior

```jsx
<AccessibleButton
  accessibilityLabel="Save changes"
  accessibilityHint="Saves your profile settings"
  onPress={handleSave}
>
  <Text style={{ color: 'white' }}>Save</Text>
</AccessibleButton>
```

`EnlargedTouchable`:
- Wrapper that increases touch target size when `enlargeButtons` is active

```jsx
<EnlargedTouchable onPress={onTap} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
  <Text>Tap target auto-expands</Text>
</EnlargedTouchable>
```

### 5. Image Accessibility

`AccessibleImage` props:
- `source`, `style`
- `alt` (default `"Image"`)
- `showPlaceholder` (default `true`)
- `showAltTextOnPress` (default `true`)

Behavior:
- Hides image if `hideImages` is enabled
- Shows tooltip with alt text on press when `imageDescription` is enabled

```jsx
<AccessibleImage
  source={{ uri: imageUrl }}
  style={{ width: 180, height: 120 }}
  alt="Nurse assisting a patient"
/>
```

`FilteredImage` props:
- `source`, `style`, `resizeMode`, and standard RN `Image` props

Behavior:
- Applies grayscale/invert/saturation/high-contrast style filters from context

```jsx
<FilteredImage source={require('./banner.png')} style={{ width: 240, height: 120 }} />
```

`AccessibleFilteredImage`:
- Combines both image description and visual filter behavior

```jsx
<AccessibleFilteredImage
  source={require('./poster.png')}
  style={{ width: 240, height: 140 }}
  alt="Health awareness poster"
/>
```

### 6. Reading Support Features

`TextMagnifier` props:
- `enabled`
- `textStyle`
- `children`

Behavior:
- Long-press magnifier overlay (optimized for iOS gesture behavior)

```jsx
<TextMagnifier enabled={textMagnifierEnabled}>
  <Text style={{ fontSize: 16 }}>Long press to magnify this paragraph.</Text>
</TextMagnifier>
```

`DictionaryLookup` props:
- `enabled`
- `children`

Behavior:
- Turns words into tappable definitions
- Uses `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

```jsx
<DictionaryLookup enabled={dictionaryEnabled}>
  <Text style={{ fontSize: 16 }}>
    Tap any word to see its dictionary definition.
  </Text>
</DictionaryLookup>
```

`ReadingGuide` props:
- `maskEnabled`
- `lineEnabled`
- `maskColor` (default `rgba(0, 0, 0, 0.7)`)
- `lineColor` (declared, current UI line uses built-in style)

Behavior:
- Draggable reading mask/line overlay to guide eye focus

```jsx
<ReadingGuide maskEnabled={readingMask} lineEnabled={readingLine}>
  <ScrollView>{/* content */}</ScrollView>
</ReadingGuide>
```

### 7. Text To Speech and Page Reading

`usePageRead(textToRead)` returns:
- `isSpeaking`
- `currentWordIndex`
- `words`
- `start()`, `pause()`, `resume()`, `stop()`

```ts
const reader = usePageRead(longText);
await reader.start();
await reader.pause();
await reader.resume();
await reader.stop();
```

`ReadModal` props:
- `activeModal` (`boolean`)

Behavior:
- Draggable/minimizable reader
- Voice/rate/pitch/volume controls
- Start/pause/resume/stop actions

```jsx
<ReadModal activeModal={textToSpeech} />
```

`TTSService` methods:
- `init()`
- `speak(text, { language, rate, pitch })`
- `stop()`
- `isAvailable()`
- `getVoices()`
- `readPage(textContent)`

```js
import { TTSService } from '@teknopoint-mobile-team/accessibility-sdk';

await TTSService.init();
await TTSService.speak('Welcome to accessibility mode', { rate: 0.5, pitch: 1.0 });
```

`ScreenReaderControls` props:
- `onVoiceSettingsChange(settings)`

Behavior:
- In-app voice selector and speech tuning panel

```jsx
<ScreenReaderControls onVoiceSettingsChange={(settings) => console.log(settings)} />
```

### 8. Color and Theme Handling

`AccessibilityColorWrapper`:
- Applies theme background and status bar adjustments
- Applies web filter effects for inversion/saturation/grayscale

```jsx
<AccessibilityColorWrapper>
  <AppRoutes />
</AccessibilityColorWrapper>
```

`useDynamicColors()`:
- Returns processed color map using context settings and `getColors`

```jsx
const colors = useDynamicColors();
<View style={{ backgroundColor: colors.defaultBackground }} />
```

`useThemeColors()`:
- Returns semantic palette (`background`, `text`, `primary`, `secondary`, etc.)

```jsx
const theme = useThemeColors();
<Text style={{ color: theme.text }}>Theme-aware text</Text>
```

`Colors` and `getColors(settings)`:
- `Colors`: base color object
- `getColors`: accessibility-aware transformed colors

```js
import { getColors } from '@teknopoint-mobile-team/accessibility-sdk';
const colors = getColors({ highContrast: true, colorTheme: 'dark' });
```

### 9. Native Accessibility Bridge

`NativeAccessibilityBridge` methods:
- `initialize(updateCallback)`
- `announce(message, options)`
- `announceForAccessibilityWithOptions(message, options)`
- `setAccessibilityFocus(reactTag)`
- `cleanup()`

```js
import { NativeAccessibilityBridge } from '@teknopoint-mobile-team/accessibility-sdk';

await NativeAccessibilityBridge.initialize((nativeSettings) => {
  console.log('Native settings changed', nativeSettings);
});

NativeAccessibilityBridge.announce('Screen loaded');
```

### 10. Profiles and Utilities

Constants:
- `ACCESSIBILITY_PROFILES`
- `COLOR_THEMES`
- `TEXT_ALIGNMENT`
- `DEFAULT_ACCESSIBILITY_STATE`
- `PROFILE_CONFIGS`
- `MIN_TOUCH_TARGET`

Helpers:
- `applyProfile(profile)`
- `getAdjustedFontSize(baseFontSize, fontScale)`
- `getAdjustedLineHeight(baseFontSize, lineHeightMultiplier, fontScale)`
- `getButtonPadding(baseSize, enlargeButtons)`
- `applyColorInversion(enabled)`
- `applyGreyscale(enabled)`

```js
import { ACCESSIBILITY_PROFILES, applyProfile } from '@teknopoint-mobile-team/accessibility-sdk';

const lowVisionPreset = applyProfile(ACCESSIBILITY_PROFILES.LOW_VISION);
```

Storage helpers:
- `saveAccessibilityPreferences(preferences)`
- `loadAccessibilityPreferences()`
- `clearAccessibilityPreferences()`

### 11. Runtime Bridge (Compatibility Layer)

`AccessibilityRuntime` and `setRuntime` are kept for compatibility with components that still read runtime globals.

```js
import { setRuntime } from '@teknopoint-mobile-team/accessibility-sdk';

setRuntime({
  fontScale: 1,
  pageReadText: 'Example article content',
  accessibility: {
    textAlignment: 'left',
    pageRead: false,
  },
});
```

## Full Export Reference

Components:
- `AccessibilityButton`
- `AccessibilityModal`
- `AccessibilityColorWrapper`
- `AccessibleText`
- `AccessibleButton`
- `AccessibleImage`
- `FilteredImage`
- `AccessibleFilteredImage`
- `TextMagnifier`
- `DictionaryLookup`
- `ReadingGuide`
- `EnlargedTouchable`
- `AlignedText`
- `ReadModal`
- `ScreenReaderControls`
- `TextControlsWithSlider`
- `ProfileTester`

Hooks:
- `useAccessibility`
- `useDynamicColors`
- `useThemeColors`
- `usePageRead`

Provider:
- `AccessibilityProvider`

Services and bridges:
- `TTSService`
- `NativeAccessibilityBridge`
- `AccessibilityRuntime`
- `setRuntime`

Utilities and data:
- `Colors`
- `getColors`
- everything exported from `AccessibilityUtils`
- everything exported from `AccessibilityStorage`

## Troubleshooting

`npm install` fails for this package:
- Ensure consuming app `.npmrc` includes org registry mapping and auth token.

TTS is silent on iOS:
- Ensure silent switch handling permissions and device audio state are valid.
- Confirm `react-native-tts` is linked correctly and pods are installed.

Filters not showing as expected on iOS:
- Some high-contrast filter combinations are intentionally bypassed on iOS to avoid image disappearing behavior.

Modal/button not visible:
- Confirm app root is wrapped with `AccessibilityProvider`.

## Publish

See `PUBLISHING.md` for private package publishing with GitHub Packages.
