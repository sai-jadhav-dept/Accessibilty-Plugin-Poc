#!/bin/bash

# iOS Setup Script for AccessibilityPlugin
# This script ensures all iOS dependencies and configurations are properly set up

echo "🚀 Starting iOS setup..."

# Navigate to iOS directory
cd ios || exit

echo "📦 Installing CocoaPods dependencies..."
# Remove old pods if they exist
if [ -d "Pods" ]; then
  echo "Removing old Pods directory..."
  rm -rf Pods
fi

if [ -f "Podfile.lock" ]; then
  echo "Removing old Podfile.lock..."
  rm -f Podfile.lock
fi

# Update CocoaPods repo (optional, uncomment if needed)
# echo "Updating CocoaPods repo..."
# pod repo update

# Install pods
echo "Installing pods..."
pod install

if [ $? -eq 0 ]; then
  echo "✅ CocoaPods installation successful!"
else
  echo "❌ CocoaPods installation failed!"
  exit 1
fi

# Go back to root directory
cd ..

# Link vector icon fonts
echo "🔗 Linking vector icon fonts..."
npx react-native-asset

if [ $? -eq 0 ]; then
  echo "✅ Font assets linked successfully!"
else
  echo "⚠️  Font linking had warnings, but may still work"
fi

echo ""
echo "✨ iOS setup complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open ios/AccessibilityPlugin.xcworkspace in Xcode (NOT .xcodeproj)"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Connect your iOS device or start a simulator"
echo "4. Run: npm run ios"
echo ""
echo "Or simply run: npx react-native run-ios"
