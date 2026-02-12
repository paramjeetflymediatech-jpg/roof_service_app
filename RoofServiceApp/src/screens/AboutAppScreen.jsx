import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS, FONTS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

// Determine if we need to require the logo or if it's already available
// Assuming a logo exists in assets, otherwise we can use a placeholder text
// import Logo from '../assets/logo.png';

const AboutAppScreen = () => {
  const navigation = useNavigation();

  const appVersion = '1.0.0'; // You can fetch this from package.json or constants if preferred

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/roofing-logo.png')}
            style={styles.logoImage}
          />
          <Text style={styles.appName}>MainStreet Roofing</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionText}>
            MainStreet Roofing App is designed to streamline roofing service
            requests, management, and execution. Whether you are a client
            looking for a quote, or an employee managing jobs, this app connects
            everyone efficiently.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Easy Service Requests</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Real-time Job Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Seamless Communication</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Secure & Private</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} MainStreet Roofing. All rights
            reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(35),
    paddingBottom: verticalScale(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    ...SHADOWS.small,
    zIndex: 10,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: moderateScale(24),
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(40),
    flexGrow: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: verticalScale(30),
  },
  logoImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    resizeMode: 'contain',
    marginBottom: verticalScale(16),
  },
  appName: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(4),
  },
  appVersion: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
  },
  sectionText: {
    fontSize: moderateScale(14),
    color: COLORS.text,
    lineHeight: verticalScale(22),
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  featureBullet: {
    fontSize: moderateScale(20),
    color: COLORS.primary || '#007bff',
    marginRight: moderateScale(10),
  },
  featureText: {
    fontSize: moderateScale(14),
    color: COLORS.text,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: verticalScale(20),
  },
  footerText: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
  },
});

export default AboutAppScreen;
