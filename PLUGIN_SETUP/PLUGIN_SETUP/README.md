# React Native Accessibility Toolkit

A comprehensive accessibility toolkit for React Native applications, providing features like text-to-speech, screen reader support, color adjustments, text magnification, and more.

## Features

✅ **Text to Speech (TTS)** - Read page content aloud with voice controls  
✅ **Screen Reader Support** - TalkBack (Android) & VoiceOver (iOS) integration  
✅ **Text Magnification** - Magnify text on tap for better readability  
✅ **Dictionary Lookup** - Get word definitions on long-press  
✅ **Reading Guides** - Reading mask and line guide for focus  
✅ **Font & Spacing Controls** - Adjust text size and letter spacing  
✅ **Color Adjustments** - High contrast, grayscale, color inversion  
✅ **Text Alignment** - Left, center, right, justify options  
✅ **Link Highlighting** - Make links more visible  
✅ **Button Enlargement** - Make interactive elements bigger  
✅ **Reduced Motion** - Disable animations for users with motion sensitivity  
✅ **Image Descriptions** - Accessible images with alt text  

## Installation

```bash
npm install @yourorg/react-native-accessibility-toolkit
# or
yarn add @yourorg/react-native-accessibility-toolkit
```

### Install Peer Dependencies

```bash
npm install react-native-tts @react-native-async-storage/async-storage react-native-draggable @miblanchard/react-native-slider react-native-element-dropdown
```

### iOS Additional Setup

```bash
cd ios && pod install
```

Add to your `Info.plist`:

```xml
<key>NSSpeechRecognitionUsageDescription</key>
<string>This app uses speech recognition for accessibility features</string>
```

## Basic Usage

### 1. Wrap Your App with AccessibilityProvider

```javascript
import React from 'react';
import { AccessibilityProvider } from '@yourorg/react-native-accessibility-toolkit';
import App from './App';

export default function Root() {
  return (
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  );
}
```

### 2. Add Accessibility Button

```javascript
import { AccessibilityButton, AccessibilityModal } from '@yourorg/react-native-accessibility-toolkit';

export default function MyScreen() {
  return (
    <View>
      {/* Your content */}
      
      {/* Floating accessibility button */}
      <AccessibilityButton />
      
      {/* Accessibility settings modal */}
      <AccessibilityModal />
    </View>
  );
}
```

### 3. Use Accessibility Hooks

```javascript
import { useAccessibility, useDynamicColors } from '@yourorg/react-native-accessibility-toolkit';

export default function MyComponent() {
  const { 
    fontScale, 
    letterSpacing, 
    textAlignment,
    updateSetting 
  } = useAccessibility();
  
  const colors = useDynamicColors();

  return (
    <Text 
      style={{
        fontSize: 16 * fontScale,
        letterSpacing: letterSpacing,
        textAlign: textAlignment,
        color: colors.primaryTextColor,
      }}
    >
      Accessible Text
    </Text>
  );
}
```

## Components

### AccessibleImage

Automatically shows alt text when images are hidden:

```javascript
import { AccessibleImage } from '@yourorg/react-native-accessibility-toolkit';

<AccessibleImage
  source={require('./image.png')}
  alt="Description of the image"
  style={styles.image}
/>
```

### TextMagnifier

Enable text magnification on tap:

```javascript
import { TextMagnifier } from '@yourorg/react-native-accessibility-toolkit';

<TextMagnifier enabled={true}>
  <Text>Tap to magnify this text</Text>
</TextMagnifier>
```

### DictionaryLookup

Long-press words for definitions:

```javascript
import { DictionaryLookup } from '@yourorg/react-native-accessibility-toolkit';

<DictionaryLookup enabled={true}>
  <Text>Long press any word for definition</Text>
</DictionaryLookup>
```

### ReadingGuide

Add reading mask or line guide:

```javascript
import { ReadingGuide } from '@yourorg/react-native-accessibility-toolkit';

<ReadingGuide maskEnabled={true} lineEnabled={false}>
  <View>
    {/* Your content */}
  </View>
</ReadingGuide>
```

### ReadModal

Page reader with voice controls:

```javascript
import { ReadModal } from '@yourorg/react-native-accessibility-toolkit';

<ReadModal activeModal={isReading} />
```

## API Reference

### useAccessibility Hook

Returns accessibility state and controls:

```javascript
const {
  // Text Settings
  fontScale,        // number (0.8 - 2.0)
  letterSpacing,    // number (0 - 5)
  textAlignment,    // 'left' | 'center' | 'right' | 'justify'
  lineHeight,       // number (1.0 - 3.0)
  
  // Color Settings
  highContrast,     // boolean
  colorInversion,   // boolean
  greyscale,        // boolean
  
  // Feature Toggles
  textMagnifier,    // boolean
  dictionary,       // boolean
  readingMask,      // boolean
  readingLine,      // boolean
  highlightLinks,   // boolean
  enlargeButtons,   // boolean
  reducedMotion,    // boolean
  
  // Methods
  updateSetting,    // (key: string, value: any) => void
  setProfile,       // (profile: string) => void
  resetToDefault,   // () => void
  announce,         // (message: string) => void
  
  // Modal Controls
  isModalVisible,   // boolean
  openModal,        // () => void
  closeModal,       // () => void
} = useAccessibility();
```

### Profiles

Pre-configured accessibility profiles:

- `blindness` - For blind users (TTS, screen reader)
- `visuallyImpaired` - For low vision (high contrast, large text)
- `cognitive` - For cognitive disabilities (simplified UI)
- `epilepsy` - For seizure prevention (reduced motion, safe colors)
- `adhd` - For ADHD (focus tools, reduced distractions)

```javascript
const { setProfile } = useAccessibility();

setProfile('visuallyImpaired');
```

## Advanced Usage

### Custom Color Theme

```javascript
import { useAccessibility } from '@yourorg/react-native-accessibility-toolkit';

const { updateSetting } = useAccessibility();

// Set custom colors
updateSetting('colorTheme', 'dark');
updateSetting('accentColor', '#FF5722');
updateSetting('textColor', '#FFFFFF');
updateSetting('backgroundColor', '#121212');
```

### TTS Service

Direct access to Text-to-Speech:

```javascript
import { TTSService } from '@yourorg/react-native-accessibility-toolkit';

// Speak text
await TTSService.speak('Hello world', {
  language: 'en-US',
  rate: 0.5,
  pitch: 1.0,
});

// Stop speaking
TTSService.stop();

// Get available voices
const voices = await TTSService.getVoices();
```

## Customization

### Override Default Settings

```javascript
import { AccessibilityProvider, DEFAULT_ACCESSIBILITY_STATE } from '@yourorg/react-native-accessibility-toolkit';

const customDefaults = {
  ...DEFAULT_ACCESSIBILITY_STATE,
  fontScale: 1.2,
  highContrast: true,
};

<AccessibilityProvider initialState={customDefaults}>
  <App />
</AccessibilityProvider>
```

## Testing

```bash
npm test
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

MIT © [Your Name]

## Support

- 📧 Email: support@example.com
- 🐛 Issues: https://github.com/yourorg/react-native-accessibility-toolkit/issues
- 📖 Docs: https://yourorg.github.io/react-native-accessibility-toolkit

## Acknowledgments

Built with ❤️ for inclusive app development.
