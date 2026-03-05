# Accessibility Mobile Plugin Documentation

This document is written for both non-technical and technical readers:
- **Marketing / Client teams** can understand feature value and user impact.
- **Developers / QA teams** can understand implementation, setup, and usage.

---

## 1) Project Overview / Features

### 1.1 What this project is
This project is a React Native accessibility plugin layer for mobile apps. It provides a floating **Accessibility Menu** from which users can personalize how they read, view, and navigate content.

### 1.2 Business value (simple language)
- Improves app usability for people with vision, cognitive, and motor accessibility needs.
- Helps meet accessibility expectations with configurable controls.
- Gives users one-tap profiles (preset combinations) instead of forcing manual setup.
- Improves engagement by making long-form content easier to consume.

### 1.3 Implemented feature list

#### A) Reading and content features
1. **Page Read / TTS** (read screen text aloud)
2. **Dictionary** (word meaning popup)
3. **Image Description** (alt text tooltip)
4. **Hide Images** (remove image clutter)
5. **Text Magnifier** (long-press zoom)
6. **Text Controls** (font size, line height, letter spacing)

#### B) Visual and color features
1. Dark Mode
2. Invert Colors
3. Low Saturation
4. High Saturation
5. Grayscale
6. Dark High Contrast
7. White High Contrast
8. Text Color adjustment
9. Background Color adjustment

#### C) Navigation and focus features
1. Reading Line
2. Highlight Links
3. Reading Mask
4. Reading Mask + Line
5. Pause Animation / Reduced Motion

#### D) Interaction features
1. Enlarge Buttons (larger touch targets)

#### E) One-tap accessibility profiles
1. Blindness Profile
2. Cognitive & Learning Profile
3. Epilepsy Safe Profile
4. ADHD Focus Profile

#### F) Platform support
1. Native accessibility detection (screen reader/reduced motion/etc.)
2. Persistent storage of user accessibility preferences
3. Cross-component state sync

---

## 2) Technical Architecture

### 2.1 High-level architecture
The system follows a **context-driven architecture**.

1. `AccessibilityContext` holds global accessibility state.
2. `AccessibilityModal` is the main control panel for all toggles.
3. Reusable components (`AccessibleText`, `AccessibleButton`, etc.) read context and auto-apply settings.
4. Service layer handles TTS, native bridge, and storage.

### 2.2 Runtime flow
1. App starts.
2. Preferences are loaded from async storage.
3. Native settings are detected and merged.
4. User changes a setting in menu.
5. Context updates -> subscribed components re-render.
6. Updated state is persisted.

### 2.3 Core implementation files
- `src/accessibility/AccessibilityContext.js`
- `src/accessibility/AccessibilityModal.js`
- `src/accessibility/AccessibilityUtils.js`
- `src/accessibility/AccessibilityStorage.js`
- `src/accessibility/NativeAccessibilityBridge.js`
- `src/accessibility/TTSService.js`
- `src/accessibility/DictionaryLookup.js`
- `src/accessibility/TextMagnifier.js`
- `src/accessibility/ReadingGuide.js`
- `src/accessibility/AccessibleText.js`
- `src/accessibility/AccessibleButton.js`
- `src/accessibility/AccessibleImage.js`
- `src/accessibility/AccessibleFilteredImage.js`

### 2.4 Code example: app-level wiring

```jsx
import React from 'react';
import { View } from 'react-native';
import { AccessibilityProvider, AccessibilityButton, AccessibilityModal } from './src/accessibility';
import AccessibilityColorWrapper from './src/accessibility/AccessibilityColorWrapper';
import Intro from './src/screens/Intro';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
   return (
      <SafeAreaProvider>
         <AccessibilityProvider>
            <AccessibilityColorWrapper>
               <View style={{ flex: 1 }}>
                  <Intro />
                  <AccessibilityButton />
                  <AccessibilityModal />
               </View>
            </AccessibilityColorWrapper>
         </AccessibilityProvider>
      </SafeAreaProvider>
   );
}
```

### 2.5 Code example: state update pattern

```js
const { updateSetting } = useAccessibility();

// enable or disable any feature
updateSetting('textToSpeech', true);
updateSetting('enlargeButtons', true);
updateSetting('readingMask', false);
```

---

## 3) Setup and Installation Instructions

## 3.1 Prerequisites
- Node.js `>=20`
- React Native environment configured
- Android Studio (Android build)
- Xcode + CocoaPods (iOS build on macOS)

## 3.2 Install dependencies

```bash
npm install
```

## 3.3 Start Metro

```bash
npm start
```

## 3.4 Run Android

```bash
npm run android
```

## 3.5 Run iOS (macOS only)

```bash
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

## 3.6 Link assets (fonts/icons)

```bash
npx react-native-asset
```

## 3.7 Useful scripts
- `npm run android` -> run Android app
- `npm run ios` -> run iOS app
- `npm start` -> Metro server
- `npm test` -> tests
- `npm run lint` -> lint checks

## 3.8 Troubleshooting quick fixes

```bash
# Clean Android build
cd android && gradlew clean && cd ..

# Reinstall iOS pods
cd ios && rm -rf Pods Podfile.lock && pod install --repo-update && cd ..
```

---

## 4) Usage Guide

### 4.1 For end users (non-technical)
1. Tap accessibility floating button.
2. Open menu and select required feature(s).
3. Optionally use a profile preset for one-tap setup.
4. Close menu and continue using app.
5. Settings are remembered next time app opens.

### 4.2 For product/marketing teams
- Use profile presets to demo target user personas.
- Use TTS + reading guides to showcase inclusive reading experience.
- Use color/high-contrast options to demonstrate low-vision support.

### 4.3 For developers: add accessibility to a new screen

#### Step 1: use accessible components
```jsx
import {
   AccessibleText,
   AccessibleButton,
   AccessibleFilteredImage,
} from '../accessibility';
```

#### Step 2: apply components in UI
```jsx
function HealthCard() {
   return (
      <>
         <AccessibleText baseFontSize={16}>Daily medicine reminder</AccessibleText>

         <AccessibleFilteredImage
            source={require('../assets/images/medicine.png')}
            alt="Medicine reminder icon"
            style={{ width: 80, height: 80 }}
         />

         <AccessibleButton
            accessibilityLabel="Open medicine details"
            accessibilityHint="Opens medication detail screen"
            onPress={() => {}}
         >
            <AccessibleText baseFontSize={14}>Open</AccessibleText>
         </AccessibleButton>
      </>
   );
}
```

#### Step 3: add advanced wrappers (optional)
```jsx
import DictionaryLookup from '../accessibility/DictionaryLookup';
import TextMagnifier from '../accessibility/TextMagnifier';
import ReadingGuide from '../accessibility/ReadingGuide';

function ArticleSection({ children, dictionaryEnabled, magnifierEnabled, readingMask, readingLine }) {
   return (
      <ReadingGuide maskEnabled={readingMask} lineEnabled={readingLine}>
         <DictionaryLookup enabled={dictionaryEnabled}>
            <TextMagnifier enabled={magnifierEnabled}>
               {children}
            </TextMagnifier>
         </DictionaryLookup>
      </ReadingGuide>
   );
}
```

### 4.4 QA checklist before release
- Verify each toggle works independently.
- Verify profile presets activate expected settings.
- Verify persistence after app restart.
- Verify Android + iOS parity.
- Verify screen-reader announcements and labels.
- Verify combined scenarios (e.g., hide images + high contrast + enlarged buttons).

---

## 5) Summary for stakeholder review
- The plugin is already functional with major accessibility controls.
- It supports both user-level customization and one-tap profile presets.
- Technical architecture is modular and reusable for future screens.
- Setup and usage are straightforward for product demos and engineering rollout.
