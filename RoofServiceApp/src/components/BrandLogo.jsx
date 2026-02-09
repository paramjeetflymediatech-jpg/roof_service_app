import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { moderateScale } from '../utils/responsive';

const BrandLogo = ({ style, imageStyle, resizeMode = 'contain' }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/roofing-logo.png')}
        style={[styles.logo, imageStyle]}
        resizeMode={resizeMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: moderateScale(150),
    height: moderateScale(150),
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(30),
  },
});

export default BrandLogo;
