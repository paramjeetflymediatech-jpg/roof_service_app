import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: February 12, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Welcome to Main Street Roofing. We respect your privacy and are
            committed to protecting your personal data. This privacy policy will
            inform you as to how we look after your personal data when you visit
            our app and tell you about your privacy rights and how the law
            protects you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Data We Collect</Text>
          <Text style={styles.text}>
            We may collect, use, store and transfer different kinds of personal
            data about you which we have grouped together follows:
          </Text>
          <Text style={styles.bulletPoint}>
            • Identity Data: includes first name, last name, username or similar
            identifier.
          </Text>
          <Text style={styles.bulletPoint}>
            • Contact Data: includes email address and telephone numbers.
          </Text>
          <Text style={styles.bulletPoint}>
            • Transaction Data: includes details about payments to and from you
            and other details of products and services you have purchased from
            us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
          <Text style={styles.text}>
            We will only use your personal data when the law allows us to. Most
            commonly, we will use your personal data in the following
            circumstances:
          </Text>
          <Text style={styles.bulletPoint}>
            • Where we need to perform the contract we are about to enter into
            or have entered into with you.
          </Text>
          <Text style={styles.bulletPoint}>
            • Where it is necessary for our legitimate interests (or those of a
            third party) and your interests and fundamental rights do not
            override those interests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.text}>
            We have put in place appropriate security measures to prevent your
            personal data from being accidentally lost, used or accessed in an
            unauthorized way, altered or disclosed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at mainstreetroofing604@gmail.com
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(34),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: moderateScale(20),
  },
  lastUpdated: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginBottom: verticalScale(20),
    fontStyle: 'italic',
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(8),
  },
  text: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: verticalScale(8),
  },
  bulletPoint: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    lineHeight: 24,
    marginLeft: moderateScale(10),
    marginBottom: verticalScale(4),
  },
});

export default PrivacyPolicyScreen;
