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
import { api } from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleResetRequest = async () => {
    if (!email) {
      setFeedback({
        type: 'error',
        message: 'Please enter your email address',
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await api.forgotPassword(email.trim().toLowerCase());

      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: 'Reset code sent! Redirecting...',
        });
        setTimeout(() => {
          navigation.navigate('ResetPassword', { email });
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: response.data.message || 'Failed to send reset email',
        });
      }
    } catch (error) {
      console.log('Forgot password error:', error);
      const msg =
        error.response?.data?.message ||
        'Something went wrong. Please try again.';
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitleText}>
              Enter your email address to receive a password reset code.
            </Text>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
              title="Send Reset Code"
              onPress={handleResetRequest}
              loading={loading}
              style={styles.actionButton}
              size="large"
            />

            <TouchableOpacity
              onPress={() => navigation.goBack()}
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
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
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

export default ForgotPasswordScreen;
