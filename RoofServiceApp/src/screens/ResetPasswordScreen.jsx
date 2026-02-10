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
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale, scale } from '../utils/responsive';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleResetPassword = async () => {
    if (!otp || !password || !confirmPassword) {
      setFeedback({ type: 'error', message: 'All fields are required' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setFeedback({
        type: 'error',
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await api.resetPassword({
        email,
        otp,
        password,
      });

      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: 'Password reset successfully! Redirecting...',
        });
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: response.data.message || 'Failed to reset password',
        });
      }
    } catch (error) {
      console.log('Reset password error:', error);
      const msg =
        error.response?.data?.message ||
        'Invalid or expired code. Please try again.';
      setFeedback({ type: 'error', message: msg });
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <BrandLogo
              imageStyle={{
                width: moderateScale(100),
                height: moderateScale(100),
              }}
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitleText}>
              Enter the code sent to {email} and your new password.
            </Text>

            <Input
              label="Reset Code (OTP)"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              variant="dark"
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              variant="dark"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              variant="dark"
            />

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
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.actionButton}
              size="large"
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
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
    marginBottom: verticalScale(30),
  },
  formContainer: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: verticalScale(8),
  },
  subtitleText: {
    fontSize: moderateScale(16),
    color: '#cccccc',
    marginBottom: verticalScale(32),
  },
  actionButton: {
    marginTop: verticalScale(24),
    height: verticalScale(56),
    borderRadius: moderateScale(30),
    backgroundColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
  backButton: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: moderateScale(15),
    color: COLORS.white,
    fontWeight: '600',
  },
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

export default ResetPasswordScreen;
