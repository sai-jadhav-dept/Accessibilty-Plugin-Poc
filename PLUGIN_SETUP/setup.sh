#!/bin/bash

# Quick setup script for converting to plugin

echo "🚀 Setting up React Native Accessibility Toolkit Plugin..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/components src/context src/hooks src/services src/utils

# Copy files from existing project
echo "📋 Copying files..."
echo "Please manually copy these files:"
echo "  - src/accessibility/*.js → src/components/"
echo "  - src/accessibility/AccessibilityContext.js → src/context/"
echo "  - src/accessibility/use*.js → src/hooks/"
echo "  - src/accessibility/TTSService.js → src/services/"
echo "  - src/accessibility/NativeAccessibilityBridge.js → src/services/"
echo "  - src/accessibility/AccessibilityStorage.js → src/services/"
echo "  - src/accessibility/AccessibilityUtils.js → src/utils/"

# Initialize npm if not already done
if [ ! -f "package.json" ]; then
    echo "📦 Initializing npm..."
    npm init -y
fi

# Install dev dependencies
echo "📥 Installing dev dependencies..."
npm install --save-dev @babel/core @babel/preset-env eslint jest

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy your accessibility files to the new structure"
echo "2. Remove project-specific dependencies (Global, Colors, etc.)"
echo "3. Test the package locally with 'npm link'"
echo "4. Publish to npm with 'npm publish'"
echo ""
echo "📖 Read INSTALLATION_GUIDE.md for detailed instructions"
