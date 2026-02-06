import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import { api } from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS } from '../utils/constants';

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
        // Just set the user in context - RootNavigator will automatically re-render
        // with the authenticated stack, which includes the role-appropriate home screen
        await login(userData);
        // Navigation happens automatically via conditional rendering in App.jsx
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
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Roof Service</Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  loginButton: {
    marginTop: 8,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoHint: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
