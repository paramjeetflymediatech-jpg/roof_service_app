import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const { width } = Dimensions.get('window');

const BeautifulAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'destructive', 'success'
  showCancel = true,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getHeaderColor = () => {
    switch (type) {
      case 'destructive':
        return COLORS.error;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'destructive':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
          ]}
        >
          <View style={[styles.header, { backgroundColor: getHeaderColor() }]}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.footer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: getHeaderColor() },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  header: {
    height: verticalScale(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: moderateScale(28),
  },
  content: {
    padding: moderateScale(24),
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  message: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
  footer: {
    flexDirection: 'row',
    padding: moderateScale(16),
    gap: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: moderateScale(16),
  },
  confirmButton: {
    ...SHADOWS.small,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
});

export default BeautifulAlert;
