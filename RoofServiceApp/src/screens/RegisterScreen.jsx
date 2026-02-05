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
import { COLORS } from '../utils/constants';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: 'user', // Always register as client
      });

      if (response.data.success) {
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token,
        };

        Alert.alert('Success', 'Account created successfully!');
        await login(userData);
        navigation.navigate('Login');
        console.log('Registered user data:', userData);
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error);
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Roof Service</Text>
            <Text style={styles.subtitle}>Create Your Account</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitleText}>
              Fill in your details to get started
            </Text>

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={value => updateField('name', value)}
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={value => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={value => updateField('phone', value)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <Input
              label="Address (Optional)"
              placeholder="Enter your address"
              value={formData.address}
              onChangeText={value => updateField('address', value)}
              multiline
              numberOfLines={2}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={value => updateField('password', value)}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={value => updateField('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
