const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = path.join(screenshotsDir, `ios_screenshot_${timestamp}.png`);

console.log('📸 Attempting to take iOS Simulator screenshot...');

try {
  // Use xcrun simctl screenshot to capture the booted simulator
  // This captures the only booted simulator or fails if multiple are booted.
  execSync(`xcrun simctl io booted screenshot "${filename}"`, { stdio: 'inherit' });
  console.log(`✅ Screenshot saved to: ${filename}`);

  // Auto-resize to requested dimensions if needed
  try {
    const dimensions = execSync(`sips -g pixelWidth -g pixelHeight "${filename}"`)
      .toString()
      .split('\n')
      .reduce((acc, line) => {
        const match = line.match(/(pixelWidth|pixelHeight):\s+(\d+)/);
        if (match) acc[match[1]] = parseInt(match[2], 10);
        return acc;
      }, {});

    const { pixelWidth, pixelHeight } = dimensions;
    const targets = [
      { w: 1242, h: 2688 }, // 6.5" Portrait
      { w: 2688, h: 1242 }, // 6.5" Landscape
      { w: 1284, h: 2778 }, // 6.7" Portrait
      { w: 2778, h: 1284 }, // 6.7" Landscape
    ];

    const isCorrectSize = targets.some(t => t.w === pixelWidth && t.h === pixelHeight);

    if (!isCorrectSize) {
      // Default to 6.7" dimensions based on orientation
      let targetW, targetH;
      if (pixelHeight > pixelWidth) {
        // Portrait
        targetW = 1284;
        targetH = 2778;
      } else {
        // Landscape
        targetW = 2778;
        targetH = 1284;
      }

      console.log(`📏 Resizing from ${pixelWidth}x${pixelHeight} to ${targetW}x${targetH}...`);
      execSync(`sips -z ${targetH} ${targetW} "${filename}"`);
      console.log(`✨ Resized successfully!`);
    }
  } catch (resizeError) {
    console.warn('⚠️  Could not check or resize image dimensions (sips might be missing or failed).', resizeError.message);
  }
  
  // Try to open the screenshot folder (macOS only)
  if (process.platform === 'darwin') {
    execSync(`open "${screenshotsDir}"`);
  }
} catch (error) {
  console.error('\n❌ Failed to take screenshot.', error.message || error);
  console.log('Possible causes:');
  console.log('1. No iOS Simulator is currently booted.');
  console.log('2. Multiple iOS Simulators are booted (specify UDID).');
  console.log('3. Xcode command line tools are not installed.\n');
  
  console.log('For physical devices, please install libimobiledevice:');
  console.log('  brew install libimobiledevice');
  console.log(`  idevicescreenshot "${filename}"`);
}
