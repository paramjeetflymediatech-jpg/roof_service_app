import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SHADOWS, FONTS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  disabled = false,
  style,
  textStyle,
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
        return moderateScale(FONTS.sizes.caption);
      case 'large':
        return moderateScale(FONTS.sizes.h3);
      default:
        return moderateScale(FONTS.sizes.body);
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return verticalScale(8);
      case 'large':
        return verticalScale(16);
      default:
        return verticalScale(12);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: getPadding(),
          paddingHorizontal: moderateScale(16),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: COLORS.primary,
          // Apply shadow only for solid buttons
          ...(variant !== 'outline' && variant !== 'transparent' && !disabled ? SHADOWS.small : {}),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text 
          style={[
            styles.buttonText, 
            { 
              color: getTextColor(), 
              fontSize: getFontSize() 
            },
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default Button;
