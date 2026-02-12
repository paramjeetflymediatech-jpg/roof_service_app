import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import { api } from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale, scale } from '../utils/responsive';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Personal Info, 2: Security & Address
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    // Address is optional, so no validation needed strictly,
    // but if we wanted to enforce it, we would do it here.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const response = await api.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: 'user',
      });

      if (response.data.success) {
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token,
        };

        Alert.alert('Success', 'Account created successfully!');
        await login(userData);
        // Navigation handled by AuthContext state change or:
        // navigation.navigate('Login'); // if login doesn't auto-redirect
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error.message);
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChangeText={value => updateField('name', value)}
        autoCapitalize="words"
        error={errors.name}
        variant="dark"
      />
      <Input
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={value => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        variant="dark"
      />
      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChangeText={value => updateField('phone', value)}
        keyboardType="phone-pad"
        error={errors.phone}
        variant="dark"
      />

      <Button
        title="Next"
        onPress={handleNext}
        style={styles.actionButton}
        size="large"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Input
        label="Address (Optional)"
        placeholder="Enter your address"
        value={formData.address}
        onChangeText={value => updateField('address', value)}
        multiline
        numberOfLines={2}
        variant="dark"
      />
      <Input
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChangeText={value => updateField('password', value)}
        secureTextEntry
        error={errors.password}
        variant="dark"
      />
      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChangeText={value => updateField('confirmPassword', value)}
        secureTextEntry
        error={errors.confirmPassword}
        variant="dark"
      />

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={handleBack}
          style={[styles.actionButton, styles.backButton]}
          variant="outline"
          textStyle={{ color: COLORS.white }}
        />
        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          style={[styles.actionButton, styles.createButton]}
        />
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.circle1} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <BrandLogo
              imageStyle={{
                width: moderateScale(80),
                height: moderateScale(80),
              }}
            />
            <Text style={styles.appName}>Roof Service</Text>
            <Text style={styles.stepIndicator}>
              Step {step} of 2: {step === 1 ? 'Personal Info' : 'Security'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitleText}>
              {step === 1 ? "Let's get to know you" : 'Secure your account'}
            </Text>

            {step === 1 ? renderStep1() : renderStep2()}

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: verticalScale(40),
  },
  content: {
    paddingHorizontal: moderateScale(24),
    marginTop: verticalScale(20),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  appName: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: COLORS.white,
    marginTop: verticalScale(8),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepIndicator: {
    fontSize: moderateScale(14),
    color: COLORS.secondary,
    marginTop: verticalScale(8),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'transparent',
    padding: moderateScale(10),
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: verticalScale(8),
  },
  subtitleText: {
    fontSize: moderateScale(16),
    color: '#cccccc',
    marginBottom: verticalScale(24),
  },
  actionButton: {
    marginTop: verticalScale(24),
    height: verticalScale(56),
    borderRadius: moderateScale(30),
    backgroundColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(16),
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
  },
  createButton: {
    flex: 2,
  },
  loginLinkContainer: {
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
    color: COLORS.secondary,
    fontWeight: '700',
    marginLeft: moderateScale(4),
  },
  circle1: {
    position: 'absolute',
    top: scale(-100),
    left: scale(-100),
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});

export default RegisterScreen;
