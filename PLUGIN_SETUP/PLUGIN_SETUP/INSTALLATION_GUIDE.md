# Installation & Setup Guide

## 📦 Converting Your Project to an NPM Package

### Step 1: Prepare Your Code Structure

1. **Copy accessibility files** from your current project:
   ```
   src/accessibility/ → PLUGIN_SETUP/src/
   ```

2. **Remove project-specific dependencies**:
   - Remove references to `Global.js` (replace with Context API)
   - Remove references to `GlobalStyles` (make them configurable)
   - Remove references to `Colors` utility (use theme system)

### Step 2: Make Code Generic

Replace hardcoded paths and imports:

**Before:**
```javascript
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';
import Global from '../screens/Global';
```

**After:**
```javascript
import { useAccessibility } from './context/AccessibilityContext';
```

### Step 3: Setup Git Repository

```bash
cd PLUGIN_SETUP
git init
git add .
git commit -m "Initial commit: React Native Accessibility Toolkit"
```

### Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Name it: `react-native-accessibility-toolkit`
3. Push your code:

```bash
git remote add origin https://github.com/yourorg/react-native-accessibility-toolkit.git
git branch -M main
git push -u origin main
```

### Step 5: Publish to NPM

1. **Create NPM Account**: https://www.npmjs.com/signup

2. **Login to NPM**:
   ```bash
   npm login
   ```

3. **Publish Package**:
   ```bash
   cd PLUGIN_SETUP
   npm publish --access public
   ```

4. **Update Version** (for future updates):
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   npm publish
   ```

## 🔧 Using the Plugin in Other Projects

### Installation in New Project

```bash
# Create new React Native project
npx react-native init MyAccessibleApp

# Navigate to project
cd MyAccessibleApp

# Install your plugin
npm install @yourorg/react-native-accessibility-toolkit

# Install peer dependencies
npm install react-native-tts @react-native-async-storage/async-storage react-native-draggable @miblanchard/react-native-slider react-native-element-dropdown

# iOS setup
cd ios && pod install && cd ..
```

### Setup in App.js

```javascript
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { 
  AccessibilityProvider, 
  AccessibilityButton,
  AccessibilityModal,
  useAccessibility,
  useDynamicColors 
} from '@yourorg/react-native-accessibility-toolkit';

function HomeScreen() {
  const { fontScale, letterSpacing } = useAccessibility();
  const colors = useDynamicColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.defaultBackground }]}>
      <Text 
        style={{
          fontSize: 20 * fontScale,
          letterSpacing: letterSpacing,
          color: colors.primaryTextColor,
        }}
      >
        Welcome to My Accessible App!
      </Text>
      
      {/* Floating accessibility button */}
      <AccessibilityButton />
      
      {/* Settings modal */}
      <AccessibilityModal />
    </View>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <HomeScreen />
      </SafeAreaView>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
```

## 📱 Testing the Plugin

### Test Locally Before Publishing

Use `npm link` to test locally:

```bash
# In plugin directory
cd PLUGIN_SETUP
npm link

# In your test app
cd ../MyTestApp
npm link @yourorg/react-native-accessibility-toolkit
```

### Unlink After Testing

```bash
npm unlink @yourorg/react-native-accessibility-toolkit
```

## 🚀 Distribution Options

### Option 1: Public NPM Package
- **Pros**: Easy to install, version control, wide reach
- **Cons**: Public, requires NPM account
- **Command**: `npm publish --access public`

### Option 2: Private NPM Package
- **Pros**: Private, controlled access
- **Cons**: Requires paid NPM account ($7/month)
- **Command**: `npm publish --access restricted`

### Option 3: GitHub Package Registry
- **Pros**: Free for public repos, integrated with GitHub
- **Setup**: 
  ```json
  // Add to package.json
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
  ```
- **Publish**: `npm publish`

### Option 4: Private Git Repository
- **Pros**: Full control, no NPM needed
- **Cons**: Manual version management
- **Install**: 
  ```bash
  npm install git+https://github.com/yourorg/react-native-accessibility-toolkit.git
  ```

### Option 5: Compressed File (tar.gz)
- **Create**: `npm pack`
- **Install**: `npm install /path/to/package.tgz`

## 📝 Checklist Before Publishing

- [ ] All files are in correct structure
- [ ] package.json is complete with all metadata
- [ ] README.md has clear documentation
- [ ] LICENSE file is included
- [ ] .npmignore excludes unnecessary files
- [ ] Code is tested in a separate project
- [ ] Version number follows semver (1.0.0)
- [ ] Git repository is created and pushed
- [ ] NPM account is created and verified
- [ ] Dependencies are listed correctly (peer vs regular)

## 🔄 Updating the Plugin

1. Make changes to code
2. Update version: `npm version patch/minor/major`
3. Commit changes: `git commit -am "Description"`
4. Push to GitHub: `git push`
5. Publish to NPM: `npm publish`

## 💡 Pro Tips

1. **Use Semantic Versioning**:
   - MAJOR: Breaking changes (1.0.0 → 2.0.0)
   - MINOR: New features (1.0.0 → 1.1.0)
   - PATCH: Bug fixes (1.0.0 → 1.0.1)

2. **Add TypeScript Definitions**:
   - Create `index.d.ts` for better IDE support

3. **Create Examples**:
   - Add example projects in `examples/` folder

4. **Setup CI/CD**:
   - Use GitHub Actions for automated testing/publishing

5. **Documentation**:
   - Use JSDoc comments for better IntelliSense
   - Create interactive docs with Docusaurus

## 🆘 Troubleshooting

**Issue**: Package not found after publishing
- **Solution**: Wait 5-10 minutes for NPM to index

**Issue**: Peer dependency warnings
- **Solution**: Ensure peerDependencies are correctly specified

**Issue**: Import errors in other projects
- **Solution**: Check main entry point in package.json

**Issue**: Native module linking issues
- **Solution**: Run `cd ios && pod install` for iOS

## 📞 Need Help?

Open an issue on GitHub or contact support@example.com
