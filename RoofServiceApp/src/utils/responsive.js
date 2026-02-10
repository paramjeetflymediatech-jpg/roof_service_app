import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

// Scaling functions
const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Percentage-based dimensions
const wp = percentage => (width * percentage) / 100;
const hp = percentage => (height * percentage) / 100;

// Device detection
const isSmallDevice = () => width < 375;
const isTablet = () => width >= 768;

// Responsive menu width
const getMenuWidth = () => {
  if (isTablet()) return wp(40); // 40% on tablets
  return wp(75); // 75% on phones
};

// Export screen dimensions
export {
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp,
  isSmallDevice,
  isTablet,
  getMenuWidth,
  width as screenWidth,
  height as screenHeight,
};
