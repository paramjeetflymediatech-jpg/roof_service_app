import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Button from '../components/Button';
import { COLORS } from '../utils/constants';

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
    // Animated.once(
    Animated.sequence(
      [
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ],
      // ),
    ).start();
  }, [opacityAnim, scaleAnim]);

  const handleGetStarted = () => {
    navigation.replace('Register');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: opacityAnim }]}>
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <Image
            source={require('../../assets/roofing-logo.png')}
            style={styles.logo}
            resizeMode="contain"
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
        />

        <Text style={styles.helperText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.LoginText}> You can Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
  LoginText: {
    fontSize: 12,
    color: 'blue',
    // textAlign: 'center',
    marginTop: 5,
  },
});

export default OnboardingScreen;
