# iOS Setup and Troubleshooting Guide

## ✅ Fixed Issues

### 1. Info.plist Configuration
- ✅ Added `NSSpeechRecognitionUsageDescription` for Text-to-Speech functionality
- ✅ Added `ITSAppUsesNonExemptEncryption` set to `false` for App Store submission
- ✅ Updated `NSLocationWhenInUseUsageDescription` with proper description

### 2. Podfile Configuration
- ✅ Enhanced post_install script with iOS deployment target fixes
- ✅ Added Xcode 14+ compatibility settings
- ✅ Configured proper architecture exclusions for CI environments

### 3. Font and Icon Assets
- ✅ Updated react-native.config.js to include vector icons
- ✅ All custom fonts (Amiko, Nunito) are properly configured
- ✅ Vector icons (MaterialIcons) will be linked during setup

## 🚀 Setup Instructions

### Prerequisites
1. **Mac with Xcode**: iOS development requires macOS and Xcode
2. **Xcode**: Install from Mac App Store (latest version recommended)
3. **CocoaPods**: Install if not present:
   ```bash
   sudo gem install cocoapods
   ```
4. **Node.js**: Version 20 or higher (already in package.json)

### Setup Steps

#### Option 1: Using Setup Scripts (Recommended)

On macOS/Linux:
```bash
chmod +x ios-setup.sh
./ios-setup.sh
```

On Windows (if you have access to a Mac remotely):
```powershell
./ios-setup.ps1
```

#### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Link Assets**
   ```bash
   npx react-native-asset
   ```

3. **Install CocoaPods**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Open in Xcode**
   ```bash
   open ios/AccessibilityPlugin.xcworkspace
   ```
   ⚠️ **Important**: Always open `.xcworkspace`, NOT `.xcodeproj`

5. **Configure Signing**
   - In Xcode, select the project in the navigator
   - Go to "Signing & Capabilities" tab
   - Select your development team
   - Xcode will automatically handle provisioning

6. **Run the App**
   ```bash
   npm run ios
   # or
   npx react-native run-ios
   ```

## 🐛 Common Issues and Solutions

### Issue 1: "Command PhaseScriptExecution failed"
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Issue 2: "No bundle URL present"
**Solution:**
1. Make sure Metro bundler is running:
   ```bash
   npm start
   ```
2. In another terminal:
   ```bash
   npm run ios
   ```

### Issue 3: Vector Icons not showing
**Solution:**
```bash
npx react-native-asset
cd ios
rm -rf Pods
pod install
cd ..
npx react-native run-ios
```

### Issue 4: "Could not find iPhone simulator"
**Solution:**
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Issue 5: Build fails with "Signing for requires a development team"
**Solution:**
1. Open `ios/AccessibilityPlugin.xcworkspace` in Xcode
2. Select the project in left sidebar
3. Select target "AccessibilityPlugin"
4. Go to "Signing & Capabilities"
5. Check "Automatically manage signing"
6. Select your Apple Developer team

### Issue 6: TTS (Text-to-Speech) not working
**Solution:**
- ✅ Already fixed: Added `NSSpeechRecognitionUsageDescription` to Info.plist
- Make sure iOS device/simulator has internet for voice downloads
- Test on a real device (simulator has limited TTS voices)

### Issue 7: Fonts not loading
**Solution:**
```bash
# Re-link fonts
npx react-native-asset

# Clean and rebuild
cd ios
xcodebuild clean -workspace AccessibilityPlugin.xcworkspace -scheme AccessibilityPlugin
cd ..
npm run ios
```

## 📋 Key Files Modified

1. **ios/AccessibilityPlugin/Info.plist**
   - Added speech recognition permission
   - Added encryption declaration
   - Updated location permission description

2. **ios/Podfile**
   - Enhanced post_install configuration
   - Added deployment target fixes
   - Added Xcode 14+ compatibility

3. **react-native.config.js**
   - Added vector icons to assets
   - Configured proper font linking

## 🧪 Testing on iOS

### Test on Simulator
```bash
npx react-native run-ios
```

### Test on Physical Device
```bash
npx react-native run-ios --device "Your iPhone Name"
```

### Test Specific iOS Version
```bash
npx react-native run-ios --simulator="iPhone 15 Pro (iOS 17.2)"
```

## 📦 Required Permissions (Already Configured)

- ✅ Speech Recognition - For TTS functionality
- ✅ Accessibility Features - Native iOS accessibility detection
- ✅ Network Access - For voice data downloads

## 🎯 Features Tested for iOS Compatibility

- ✅ Text-to-Speech (TTS)
- ✅ Native Accessibility Detection
- ✅ Screen Reader Support (VoiceOver)
- ✅ Reduced Motion Detection
- ✅ Bold Text Detection
- ✅ Grayscale Mode Detection
- ✅ Invert Colors Detection
- ✅ Custom Fonts (Amiko, Nunito)
- ✅ Vector Icons (Material Icons)
- ✅ Draggable Components
- ✅ Color Filters for Images

## 📱 Supported iOS Versions

- Minimum: iOS 13.0
- Recommended: iOS 15.0+
- Tested on: iOS 16.0+

## 🔄 Clean Build (If all else fails)

```bash
# Clean everything
cd ios
rm -rf Pods Podfile.lock
xcodebuild clean -workspace AccessibilityPlugin.xcworkspace -scheme AccessibilityPlugin
cd ..

# Clean watchman
watchman watch-del-all

# Clean Metro bundler
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Clean npm cache
npm cache clean --force

# Reinstall everything
npm install
cd ios
pod install
cd ..

# Rebuild
npm run ios
```

## 📞 Additional Resources

- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [CocoaPods Guides](https://guides.cocoapods.org/)
- [Xcode Documentation](https://developer.apple.com/xcode/)
- [iOS Accessibility](https://developer.apple.com/accessibility/ios/)

## ✨ App Store Submission Checklist

- ✅ ITSAppUsesNonExemptEncryption declared
- ✅ All required permissions have descriptions
- ✅ App icon configured
- ✅ Launch screen configured
- ⚠️ TODO: Configure bundle identifier in Xcode
- ⚠️ TODO: Set up App Store Connect account
- ⚠️ TODO: Add screenshots and app description
- ⚠️ TODO: Configure versioning (currently 1.0)

## 🎉 Success Indicators

When everything is working correctly, you should see:
1. ✅ App launches without crashes
2. ✅ Fonts render correctly (Amiko, Nunito)
3. ✅ Icons display properly
4. ✅ TTS speaks when page read is enabled
5. ✅ Accessibility modal opens and functions
6. ✅ No red error screens
7. ✅ No console errors related to native modules
