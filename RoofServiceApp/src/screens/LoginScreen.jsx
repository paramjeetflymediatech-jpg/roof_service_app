import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import { api } from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale, scale } from '../utils/responsive';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    try {
      const response = await api.login({
        email: email.trim().toLowerCase(),
        password,
      });
      console.log(response, 'resp');
      if (response.data.success) {
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token,
        };

        Alert.alert('Success', `Welcome, ${userData.name}!`);
        await login(userData);
      } else {
        Alert.alert('Error', response.data.message || 'Login failed');
      }
    } catch (error) {
      console.log('Login error:', error.response);
      const message =
        error.response?.data?.message ||
        'Invalid credentials. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <BrandLogo imageStyle={{ width: moderateScale(120), height: moderateScale(120) }} />
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
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(20),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  subtitle: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    ...SHADOWS.medium,
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
    marginBottom: verticalScale(30),
  },
  loginButton: {
    marginTop: verticalScale(16),
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  registerText: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
  },
  registerLink: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.primary,
    fontWeight: '700',
  },
  demoHint: {
    fontSize: moderateScale(FONTS.sizes.small),
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: verticalScale(16),
    fontStyle: 'italic',
  },
});

export default LoginScreen;
