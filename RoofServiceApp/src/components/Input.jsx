import React, { forwardRef } from 'react';
import { TextInput, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const Input = forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  error,
  style,
  ...props
}, ref) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(FONTS.sizes.caption),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: verticalScale(6),
    marginLeft: moderateScale(2),
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: verticalScale(48),
  },
  multiline: {
    minHeight: verticalScale(120),
    textAlignVertical: 'top',
    paddingTop: verticalScale(12),
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: moderateScale(FONTS.sizes.small),
    color: COLORS.error,
    marginTop: verticalScale(4),
    marginLeft: moderateScale(2),
  },
});

export default Input;
