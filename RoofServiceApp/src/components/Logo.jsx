import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const Logo = ({ size = 'small', showText = false, style }) => {
  const logoSizes = {
    tiny: 24,
    small: 36,
    medium: 60,
    large: 120,
  };

  const imageSize = logoSizes[size] || logoSizes.small;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/roofing-logo.png')}
        style={[styles.logo, { width: imageSize, height: imageSize }]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.logoText, size === 'large' && styles.logoTextLarge]}>
          Roof Service
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoTextLarge: {
    fontSize: 28,
  },
});

export default Logo;
