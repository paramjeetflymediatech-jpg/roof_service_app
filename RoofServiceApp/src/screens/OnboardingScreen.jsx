import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale, scale } from '../utils/responsive';

const OnboardingScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in overall content
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Subtle pulsing animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacityAnim, scaleAnim]);

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <Animated.View style={[styles.content, { opacity: opacityAnim }]}>
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <BrandLogo
            imageStyle={{
              width: moderateScale(180),
              height: moderateScale(180),
            }}
          />
          <Text style={styles.appName}>Roof Service</Text>
          <Text style={styles.tagline}>
            Reliable roofing, right at your fingertips.
          </Text>
        </Animated.View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Manage Your Roofing Jobs Easily</Text>
          <Text style={styles.description}>
            Request quotes, track job progress, and stay connected with your
            roofing team all in one convenient app.
          </Text>
        </View>

        <Button
          title="Get Started"
          onPress={handleGetStarted}
          style={styles.button}
          size="large"
        />

        <View style={styles.helperText}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Deep Blue Background
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
  },
  content: {
    alignItems: 'center',
    // Removed card styling for immersive feel
    paddingVertical: verticalScale(50),
    paddingHorizontal: moderateScale(10),
    marginTop: verticalScale(20),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  appName: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: COLORS.white,
    marginTop: verticalScale(20),
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: moderateScale(14),
    color: '#e0e0e0', // Slightly off-white for subtitle
    marginTop: verticalScale(12),
    textAlign: 'center',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  textSection: {
    marginBottom: verticalScale(50),
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: verticalScale(16),
    lineHeight: verticalScale(30),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#cccccc', // Light gray for description
    textAlign: 'center',
    lineHeight: verticalScale(22),
    paddingHorizontal: moderateScale(10),
  },
  button: {
    width: '100%',
    borderRadius: moderateScale(30), // Pill shape for premium feel
    height: verticalScale(56),
    backgroundColor: COLORS.secondary, // Gold/Orange accent
    ...SHADOWS.medium,
  },
  helperText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  loginText: {
    fontSize: moderateScale(15),
    color: '#bbbbbb',
  },
  loginLink: {
    fontSize: moderateScale(15),
    color: COLORS.secondary, // Gold accent
    fontWeight: '700',
    marginLeft: moderateScale(4),
  },
  // Decorative circles
  circle1: {
    position: 'absolute',
    top: scale(-100),
    left: scale(-50),
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: scale(-50),
    right: scale(-50),
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});

export default OnboardingScreen;
