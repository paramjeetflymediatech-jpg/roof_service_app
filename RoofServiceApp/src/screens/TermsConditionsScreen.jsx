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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const TermsConditionsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : verticalScale(20) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: February 12, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
          <Text style={styles.text}>
            By accessing our app, you agree to be bound by these Terms and
            Conditions and agree that you are responsible for the agreement with
            any applicable local laws. If you disagree with any of these terms,
            you are prohibited from accessing this site.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.text}>
            Permission is granted to temporarily download one copy of the
            materials on Main Street Roofing's app for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>
            • modify or copy the materials;
          </Text>
          <Text style={styles.bulletPoint}>
            • use the materials for any commercial purpose or for any public
            display;
          </Text>
          <Text style={styles.bulletPoint}>
            • attempt to reverse engineer any software contained on Main Street
            Roofing's app;
          </Text>
          <Text style={styles.bulletPoint}>
            • remove any copyright or other proprietary notations from the
            materials.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Disclaimer</Text>
          <Text style={styles.text}>
            The materials on Main Street Roofing's app are provided "as is".
            Main Street Roofing makes no warranties, expressed or implied, and
            hereby disclaims and negates all other warranties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitations</Text>
          <Text style={styles.text}>
            In no event shall Main Street Roofing or its suppliers be liable for
            any damages (including, without limitation, damages for loss of data
            or profit, or due to business interruption) arising out of the use
            or inability to use the materials on Main Street Roofing's app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Governing Law</Text>
          <Text style={styles.text}>
            These terms and conditions are governed by and construed in
            accordance with the laws of Ontario, Canada and you irrevocably
            submit to the exclusive jurisdiction of the courts in that State or
            location.
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
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

export default TermsConditionsScreen;
