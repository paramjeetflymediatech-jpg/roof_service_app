#!/bin/bash

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Get current timestamp for filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="screenshots/ios_screenshot_${TIMESTAMP}.png"

echo "Attempting to take screenshot of iOS Simulator..."

# Try to take screenshot of the booted simulator
# xcrun simctl screenshot returns 0 on success
if xcrun simctl screenshot "$FILENAME" 2>/dev/null; then
  echo "✅ Screenshot saved to $FILENAME"
  # Open the folder to show the user
  open screenshots
else
  echo "❌ Error: Could not take screenshot."
  echo "Make sure an iOS Simulator is running and booted."
  echo ""
  echo "If you are using a physical device, you need to install 'libimobiledevice':"
  echo "  brew install libimobiledevice"
  echo "And then run: idevicescreenshot $FILENAME"
fi
