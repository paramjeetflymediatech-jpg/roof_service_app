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
      ])
    ).start();
  }, [opacityAnim, scaleAnim]);

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: opacityAnim }]}>
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <BrandLogo imageStyle={{ width: moderateScale(180), height: moderateScale(180) }} />
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
  },
  content: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(20),
    padding: moderateScale(30),
    ...SHADOWS.medium,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  appName: {
    fontSize: moderateScale(FONTS.sizes.h1),
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: verticalScale(16),
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
    marginTop: verticalScale(8),
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
  textSection: {
    marginBottom: verticalScale(32),
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(FONTS.sizes.h2),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  description: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: verticalScale(24),
  },
  button: {
    alignSelf: 'stretch',
    marginTop: verticalScale(8),
  },
  helperText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  loginText: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
  },
  loginLink: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
