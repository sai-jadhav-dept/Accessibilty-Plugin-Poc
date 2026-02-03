# iOS Setup Script for AccessibilityPlugin (Windows PowerShell)
# This script ensures all iOS dependencies and configurations are properly set up

Write-Host "🚀 Starting iOS setup..." -ForegroundColor Green

# Navigate to iOS directory
Set-Location -Path "ios"

Write-Host "📦 Installing CocoaPods dependencies..." -ForegroundColor Yellow

# Remove old pods if they exist
if (Test-Path "Pods") {
    Write-Host "Removing old Pods directory..." -ForegroundColor Yellow
    Remove-Item -Path "Pods" -Recurse -Force
}

if (Test-Path "Podfile.lock") {
    Write-Host "Removing old Podfile.lock..." -ForegroundColor Yellow
    Remove-Item -Path "Podfile.lock" -Force
}

# Install pods
Write-Host "Installing pods..." -ForegroundColor Yellow
pod install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CocoaPods installation successful!" -ForegroundColor Green
} else {
    Write-Host "❌ CocoaPods installation failed!" -ForegroundColor Red
    Write-Host "Please make sure CocoaPods is installed: sudo gem install cocoapods" -ForegroundColor Yellow
    Set-Location -Path ".."
    exit 1
}

# Go back to root directory
Set-Location -Path ".."

# Link vector icon fonts
Write-Host "🔗 Linking vector icon fonts..." -ForegroundColor Yellow
npx react-native-asset

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Font assets linked successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Font linking had warnings, but may still work" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ iOS setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open ios/AccessibilityPlugin.xcworkspace in Xcode (NOT .xcodeproj)" -ForegroundColor White
Write-Host "2. Select your development team in Signing & Capabilities" -ForegroundColor White
Write-Host "3. Connect your iOS device or start a simulator" -ForegroundColor White
Write-Host "4. Run: npm run ios" -ForegroundColor White
Write-Host ""
Write-Host "Or simply run: npx react-native run-ios" -ForegroundColor Cyan
