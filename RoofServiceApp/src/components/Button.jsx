import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  disabled = false,
  style,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.textLight;
    switch (variant) {
      case 'secondary':
        return COLORS.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return COLORS.error;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.primary;
    return COLORS.white;
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: getPadding(),
          paddingHorizontal: getPadding() * 2,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: COLORS.primary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[styles.buttonText, { color: getTextColor(), fontSize: getFontSize() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default Button;
