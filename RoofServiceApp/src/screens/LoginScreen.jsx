import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../App';
import { api } from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale, scale } from '../utils/responsive';

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await api.login({
        email: email.trim().toLowerCase(),
        password,
      });
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `Welcome, ${response.data.data.user.name}!`,
        });

        // Small delay to show success message before state update/navigation
        setTimeout(async () => {
          const userData = {
            ...response.data.data.user,
            token: response.data.data.token,
          };
          await login(userData);
        }, 1000);
      } else {
        setFeedback({
          type: 'error',
          message: response.data.message || 'Login failed',
        });
      }
    } catch (error) {
      console.log('Login error:', error.response);
      const message =
        error.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setFeedback({ type: 'error', message: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.circle1} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top > 0 ? insets.top : verticalScale(40),
            paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(40),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <BrandLogo
              imageStyle={{
                width: moderateScale(120),
                height: moderateScale(120),
              }}
            />
            <Text style={styles.appName}>Roof Service</Text>
            <Text style={styles.subtitle}>Your Trusted Roofing Partner</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitleText}>
              Enter your credentials to continue
            </Text>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              variant="dark"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              variant="dark"
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {feedback.message ? (
              <View
                style={[
                  styles.feedbackContainer,
                  feedback.type === 'error'
                    ? styles.feedbackError
                    : styles.feedbackSuccess,
                ]}
              >
                <Text style={styles.feedbackText}>{feedback.message}</Text>
              </View>
            ) : null}

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              size="large"
            />

            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.demoHint}></Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: moderateScale(24),
    marginTop: verticalScale(20),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  appName: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.white,
    marginTop: verticalScale(10),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#e0e0e0',
    marginTop: verticalScale(4),
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: 'transparent', // Removed card bg
    paddingHorizontal: moderateScale(24),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: verticalScale(8),
  },
  subtitleText: {
    fontSize: moderateScale(16),
    color: '#cccccc',
    marginBottom: verticalScale(32),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(16),
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  loginButton: {
    marginTop: verticalScale(24),
    height: verticalScale(56),
    borderRadius: moderateScale(30), // Pill shape
    backgroundColor: COLORS.secondary, // Gold accent
    ...SHADOWS.medium,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  registerText: {
    fontSize: moderateScale(15),
    color: '#bbbbbb',
  },
  registerLink: {
    fontSize: moderateScale(15),
    color: COLORS.secondary,
    fontWeight: '700',
    marginLeft: moderateScale(4),
  },
  demoHint: {
    display: 'none',
  },
  // Decorative
  circle1: {
    position: 'absolute',
    top: scale(-100),
    right: scale(-100),
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  feedbackContainer: {
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
  },
  feedbackError: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  feedbackText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
});

export default LoginScreen;
