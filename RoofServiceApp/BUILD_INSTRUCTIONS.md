# Building APK for Physical Devices

This guide explains how to build and deploy the Roof Service App APK to physical Android devices.

## Understanding the Issue

The app was crashing on physical devices because it was configured to use emulator localhost URLs (`http://10.0.2.2:5000`), which don't work on physical phones. The app now uses environment-based configuration via the `.env` file.

## Environment Configuration

### Production Build (Recommended)

The `.env` file is already configured for production:

```bash
API_BASE_URL=https://api.mainstreet-roofing.ca/api
SERVER_URL=https://api.mainstreet-roofing.ca
```

**Important**: Ensure your backend server is running and accessible at this URL before building.

### Local Network Testing (Alternative)

If you want to test with your local backend server:

1. **Find your computer's local IP address:**

   - Open Command Prompt (Windows) or Terminal (Mac/Linux)
   - Windows: Run `ipconfig` and look for **IPv4 Address**
   - Mac/Linux: Run `ifconfig` and look for **inet** address
   - Example: `192.168.1.100`

2. **Update `.env` file:**

   ```bash
   API_BASE_URL=http://192.168.1.100:5000/api
   SERVER_URL=http://192.168.1.100:5000
   ```

3. **Ensure your phone and computer are on the same Wi-Fi network**

4. **Make sure your backend server is running** (check that `npm run dev` is running in the backend folder)

### Emulator Testing

For Android emulator, update `.env`:

```bash
API_BASE_URL=http://10.0.2.2:5000/api
SERVER_URL=http://10.0.2.2:5000
```

## Building the APK

### Prerequisites

- Node.js installed
- Android SDK configured
- Java Development Kit (JDK) installed

### Build Steps

1. **Navigate to your project directory:**

   ```bash
   cd c:\Users\tech\Documents\APPS\roof_service_app\RoofServiceApp
   ```

2. **Verify `.env` configuration:**

   - Open `.env` file and confirm the URLs are correct
   - Make sure production or your local IP is configured

3. **Clean previous builds:**

   ```bash
   cd android
   .\gradlew clean
   cd ..
   ```

4. **Build Release APK:**

   ```bash
   cd android
   .\gradlew assembleRelease
   cd ..
   ```

   The APK will be generated at:

   ```
   android\app\build\outputs\apk\release\app-release.apk
   ```

5. **Alternative: Build and Install directly to connected device:**
   ```bash
   npx react-native run-android --variant=release
   ```

## Installing on Physical Device

### Method 1: Direct Install (Device Connected via USB)

1. Enable **Developer Options** and **USB Debugging** on your Android device
2. Connect your phone to computer via USB
3. Run: `npx react-native run-android --variant=release`

### Method 2: Manual APK Transfer

1. Copy the APK from `android\app\build\outputs\apk\release\app-release.apk`
2. Transfer to your phone (via email, cloud storage, or USB)
3. On your phone, open the APK file to install
4. You may need to allow installation from unknown sources

## Troubleshooting

### App Still Crashes

1. **Verify environment configuration:**

   - Check that `.env` has the correct URLs
   - Ensure no typos in the URLs

2. **Test backend connectivity:**

   - Try accessing the API URL in your phone's browser
   - For local IP: Make sure firewall isn't blocking port 5000
   - For production: Verify HTTPS certificate is valid

3. **Rebuild from clean state:**

   ```bash
   cd android
   .\gradlew clean
   cd ..
   npx react-native run-android --variant=release
   ```

4. **Check Metro bundler cache:**
   ```bash
   npx react-native start --reset-cache
   ```

### Network Errors

- **For local IP**: Ensure phone and computer are on same Wi-Fi
- **For production**: Check internet connectivity on phone
- **Firewall**: Ensure Windows Firewall allows Node.js on port 5000

### Build Errors

- Run `.\gradlew clean` in the android folder
- Delete `node_modules` and run `npm install` again
- Check that all dependencies are installed

## Testing the App

After installation:

1. **Launch the app** - It should open without crashing
2. **Test login** - Try logging in with valid credentials
3. **Check network requests** - Verify data loads from the backend
4. **Test all features** - Navigate through the app to ensure everything works

## Switching Between Environments

Whenever you change the `.env` file, you must:

1. **Stop Metro bundler** (Ctrl+C if running)
2. **Clean build:**
   ```bash
   cd android
   .\gradlew clean
   cd ..
   ```
3. **Rebuild the app:**
   ```bash
   npx react-native run-android --variant=release
   ```

> **Note**: Environment variables are bundled at build time, so runtime changes to `.env` won't affect an already-built APK.

## Production Checklist

Before releasing to production:

- [ ] `.env` configured with production URLs
- [ ] Backend server is live and accessible
- [ ] HTTPS certificate is valid (for production URL)
- [ ] App tested on multiple physical devices
- [ ] All features working correctly
- [ ] No console errors or warnings
- [ ] Build signed with production keystore (not debug keystore)

## Need Help?

If you encounter issues:

1. Check the backend server is running and accessible
2. Verify `.env` configuration
3. Review error logs in Android Studio Logcat
4. Try the troubleshooting steps above
