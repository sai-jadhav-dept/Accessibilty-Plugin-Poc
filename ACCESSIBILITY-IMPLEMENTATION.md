# Installation and Run Steps

Run these commands from project root:

```bash
npm install
npm start
```

Open a second terminal and run Android:

```bash
npm run android
```

iOS (macOS only):

```bash
npm run ios
```

Build release APK (Windows):

```bat
buildapk.bat
```

# Accessibility Summary

We have wrapped `App.js` with the accessibility provider layer to make the app accessible globally.

All accessibility features are enabled and used inside the `Intro` screen (`src/screens/Intro.js`), including text scaling, reading support, dictionary, magnifier, image accessibility behavior, and page read/TTS controls.

All accessibility feature code is inside `src/accessibility`.

In short:

1. `App.js` provides the global accessibility wrapper.
2. `AccessibilityContext` manages all accessibility global state.
3. `Intro.js` demonstrates and applies all accessibility features.
