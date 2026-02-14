# Play Store Assets Directory

This directory contains all the assets needed for Google Play Store submission.

## 📁 Directory Contents

### Generated Files

- **`privacy_policy.html`** ✅ - Privacy policy for hosting online
- **`BUILD_AND_SUBMIT_GUIDE.md`** ✅ - Complete step-by-step submission guide

### Required Files (To Be Created)

#### App Icon

- **File:** `app_icon_512.png`
- **Size:** 512x512 pixels
- **Format:** PNG with transparency (32-bit)
- **Source:** Simplify `../assets/roofing-logo.png`

#### Feature Graphic

- **File:** `feature_graphic.png`
- **Size:** 1024x500 pixels
- **Format:** PNG or JPEG
- **Design:** Professional banner with branding

#### Screenshots (in `screenshots/` folder)

- **Minimum:** 2 screenshots
- **Recommended:** 4-6 screenshots
- **Size:** 1080x1920 pixels (or similar portrait)
- **Format:** PNG or JPEG
- **Use script:** `../capture_screenshots.ps1`

## 🚀 Quick Start

### Step 1: Generate Production Keystore

```powershell
cd ..\android\app
keytool -genkeypair -v -storetype PKCS12 -keystore roofservice-release-key.keystore -alias roofservice-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Update Passwords

Edit `..\android\gradle.properties` and replace placeholder passwords with your actual keystore passwords.

### Step 3: Host Privacy Policy

Upload `privacy_policy.html` to your website or use free hosting (GitHub Pages, Google Sites).

### Step 4: Capture Screenshots

```powershell
cd ..
.\capture_screenshots.ps1
```

### Step 5: Create Visual Assets

- Create `app_icon_512.png` from your logo
- Create `feature_graphic.png` using project images from `../assets/`

### Step 6: Build Release AAB

```powershell
cd ..\android
.\gradlew clean
.\gradlew bundleRelease
```

AAB will be at: `..\android\app\build\outputs\bundle\release\app-release.aab`

### Step 7: Submit to Play Store

Follow the detailed steps in `BUILD_AND_SUBMIT_GUIDE.md`

## 📋 Checklist

Before submitting to Play Store, ensure you have:

### Files in This Directory

- [x] `privacy_policy.html`
- [x] `BUILD_AND_SUBMIT_GUIDE.md`
- [ ] `app_icon_512.png` (512x512)
- [ ] `feature_graphic.png` (1024x500)
- [ ] `screenshots/screenshot_*.png` (minimum 2)

### Configuration

- [ ] Production keystore generated
- [ ] Passwords set in `gradle.properties`
- [ ] Privacy policy hosted online (URL obtained)
- [ ] `.env` configured for production

### Build

- [ ] Release AAB built successfully
- [ ] AAB file verified (20-50MB size)

### Play Console

- [ ] Developer account created ($25)
- [ ] All store listing text ready (see `playstore_listing_content.md`)
- [ ] All assets uploaded
- [ ] All app content sections completed
- [ ] Release submitted

## 📖 Documentation References

- **Store Listing Text:** `C:\Users\tech\.gemini\antigravity\brain\[conversation-id]\playstore_listing_content.md`
- **Complete Build Guide:** `BUILD_AND_SUBMIT_GUIDE.md` (this directory)
- **Screenshot Capture:** `../capture_screenshots.ps1`
- **App Build Instructions:** `../BUILD_INSTRUCTIONS.md`

## 🆘 Need Help?

1. **Build Issues:** See `BUILD_AND_SUBMIT_GUIDE.md` troubleshooting section
2. **Asset Specifications:** See store listing content document
3. **React Native Docs:** https://reactnative.dev/docs/signed-apk-android
4. **Play Console Help:** https://support.google.com/googleplay/android-developer

---

**Good luck with your app launch! 🚀**
