import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
    width: 150,
    height: 150,
  },
});

export default BrandLogo;
