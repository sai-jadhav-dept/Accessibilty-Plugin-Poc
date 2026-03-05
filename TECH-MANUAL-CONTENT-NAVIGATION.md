# Technical Implementation Manual: Content and Navigation Sections

## Objective
This document covers the **Content** and **Navigation** sections implementation within the accessibility module. It explains the architecture, code flow, key snippets, onboarding steps, edge cases, and QA validation.

---

## 1) Scope
These sections are responsible for reading aids, focus management, and content transformations, including:

**Content Features:**
- Page Read / TTS (Text-to-Speech)
- Dictionary Lookup
- Image Description
- Hide Images
- Text Magnifier
- Text Controls (Font Scale, Line Height, Letter Spacing)

**Navigation Features:**
- Reading Line
- Highlight Links
- Reading Mask
- Reading Mask + Line (Combined Mode)
- Pause Animation / Reduced Motion

---

## 2) Core Files

### Content Logic
- **`src/accessibility/TTSService.js`**: Managed wrapper around `react-native-tts` for speech control.
- **`src/accessibility/DictionaryLookup.js`**: Component wrapper that splits text and handles API lookups.
- **`src/accessibility/AccessibleImage.js`** / **`AccessibleFilteredImage.js`**: Handles image hiding, alt text tooltips, and placeholders.
- **`src/accessibility/TextMagnifier.js`**: PanResponder-based overlay for magnifying text.
- **`src/accessibility/AccessibleText.js`**: Consumes text control settings (size, spacing) automatically.

### Navigation Logic
- **`src/accessibility/ReadingGuide.js`**: Renders the Reading Line and Reading Mask overlays.
- **`src/accessibility/AccessibilityModal.js`**: UI controls for toggling these features.
- **`src/accessibility/AccessibilityContext.js`**: State management for all toggles.

### Consumers (examples)
- `src/screens/Intro.js`
- `src/components/CommonButton.js`
- Any screen using `AccessibleText` or `ReadingGuide`.

---

## 3) Runtime Flow (Content & Navigation)

1. **User Action**: User toggles a feature (e.g., "Page Read" or "Reading Line") in `AccessibilityModal`.
2. **State Update**: Context updates via `updateSetting('featureKey', value)`.
3. **Persistence**: New state is saved to AsyncStorage (`saveAccessibilityPreferences`).
4. **React Updates**:
   - **TTS**: `useEffect` in Context/Hooks triggers `TTSService.speak()` or `stop()`.
   - **Reading Guide**: The `ReadingGuide` component re-renders to show/hide the mask or line.
   - **Text**: `AccessibleText` re-calculates styles based on new `fontScale`/`lineHeight`.
5. **Feedback**: Screen reader announcement confirms the action (e.g., "Reading line enabled").

---

## 4) UI Logic in AccessibilityModal.js

### 4.1 Content Section Pattern
Toggle buttons usually follow a simple on/off pattern, sometimes with mutual exclusion logic (like TTS vs. playing audio).

```javascript
// Example: Toggle TTS
<TouchableOpacity
    onPress={() => {
        if (textToSpeech) {
            TTSService.stop();
            updateSetting('textToSpeech', false);
        } else {
            updateSetting('textToSpeech', true);
            announce('Text to speech enabled');
        }
    }}
>
    {/* Icon & Label */}
</TouchableOpacity>
```

### 4.2 Navigation Section Pattern (Mutual Exclusion)
The Reading Guide modes often require mutually exclusive logic (Mask vs. Line vs. Both).

```javascript
// Example: Toggle Reading Line (complex logic)
onPress={() => {
    // If currently just line, toggle off. Else switch to line only.
    const isCurrentlyActive = readingLineEnabled && !readingMaskEnabled;
    const newReadingLineValue = !isCurrentlyActive;
    
    // Update state to ensure only Line is active
    updateSetting('readingLine', newReadingLineValue);
    updateSetting('readingMask', false); 
}}
```

---

## 5) Feature Implementation Details

### 5.1 Page Read / TTS (`TTSService.js`)
- **Initialization**: Sets default language (`en-US`), rate, and pitch.
- **Platform Handling**: 
  - iOS: Sets audio category to allow mixing/ducking (`setDucking(true)`).
  - Android: Awaits engine readiness.
- **Usage**: `TTSService.speak(text)` / `TTSService.stop()`.

### 5.2 Dictionary Lookup (`DictionaryLookup.js`)
- **Mechanism**: 
  - Recursively traverses children to find text strings.
  - Splits strings into pressable words.
- **API**: Fetches from `api.dictionaryapi.dev`.
- **UI**: Shows a modal with definition, synonyms, and examples.

### 5.3 Text Controls (`AccessibleText.js`)
- **Automatic scaling**:
  - `fontSize = baseFontSize * fontScale`
  - `lineHeight = baseFontSize * fontScale * lineHeightMultiplier`
- **Developer usage**: Just replace `Text` with `AccessibleText`.

### 5.4 Reading Guide (`ReadingGuide.js`)
- **Overlay System**: 
  - Uses absolute positioning `zIndex: 1000`.
  - **Mask**: Two semi-transparent views (top/bottom) creating a clear "window".
  - **Line**: A single draggable horizontal bar.
- **Interactivity**: Uses `PanResponder` to allow user to drag the guide up/down.

---

## 6) Hook Integration

### Content Hooks
`useAccessibility()` exposes:
- `textToSpeech`, `dictionary`, `imageDescription`, `hideImages`, `textMagnifier`
- `fontScale`, `lineHeight`, `letterSpacing`

### Navigation Hooks
`useAccessibility()` exposes:
- `readingLine`, `readingMask`, `highlightLinks`, `reducedMotion`

Consumers generally don't need a specialized hook like `useDynamicColors`; they consume the context values directly or use the wrapper components (`AccessibleText`, `ReadingGuide`) which handle the logic internally.

---

## 7) Consumer Integration Example

### Text Content
```javascript
import { AccessibleText, DictionaryLookup } from '../accessibility';

// Inside a screen
<DictionaryLookup enabled={dictionaryEnabled}>
    <AccessibleText baseFontSize={16}>
        Tap any word to see its definition.
    </AccessibleText>
</DictionaryLookup>
```

### Navigation Overlay
```javascript
import { ReadingGuide } from '../accessibility';

// Wrap the scrollable content or entire screen
<ReadingGuide maskEnabled={readingMask} lineEnabled={readingLine}>
    <ScrollView>
        {/* Screen Content */}
    </ScrollView>
</ReadingGuide>
```

---

## 8) New Developer Implementation Steps

1. **Add state keys**: Add new feature flags (e.g., `focusMode`) to `DEFAULT_ACCESSIBILITY_STATE`.
2. **Add Modal UI**: Create a button in `AccessibilityModal` under the relevant section.
3. **Create/Update Component**:
   - If it's a wrapper (like Mask), update `ReadingGuide` or create a new wrapper.
   - If it's a text features, update `AccessibleText`.
4. **Handle Logic**: Implement the behavior (e.g., hiding elements, changing styles).
5. **Persistence**: Ensure `AccessibilityStorage` saves the new key.
6. **Validation**: Test interactions with other active features.

---

## 9) Edge Cases and Risks

- **TTS Overlap**: System screen reader (VoiceOver/TalkBack) + App TTS can talk over each other.
- **Gesture Conflict**: `TextMagnifier` or `ReadingGuide` PanResponders might conflict with `ScrollView` or `Slider`.
- **Z-Index Wars**: Navigation overlays must be higher than content but lower than Modals/Alerts.
- **Performance**: `DictionaryLookup` splitting long text into hundreds of `Text` nodes can impact compile performance.

---

## 10) QA Checklist (Content & Navigation)

- [ ] **TTS**: Reads correctly; stops when button toggled off; respects silent mode (if configured).
- [ ] **Dictionary**: Definitions load; error handling for unknown words; modal closes properly.
- [ ] **Magnifier**: Long press activates; moves with finger; stays within bounds.
- [ ] **Text Controls**: Font size updates immediately; layout adapts without breaking.
- [ ] **Reading Guide**: Draggable; covers correct area; passes touches through the clear window.
- [ ] **Hide Images**: Images disappear; placeholders appear (if configured); layout doesn't collapse unexpectedly.
- [ ] **Persistence**: All toggles remain set after app restart.

---

## 11) Summary

The **Content** and **Navigation** sections focus on usability transformations. They rely heavily on **wrapper components** (`ReadingGuide`, `DictionaryLookup`) and **prop interception** (`AccessibleText`). Unlike the Colors section which is primarily style-token based, these features involve active runtime components and gesture handling.
