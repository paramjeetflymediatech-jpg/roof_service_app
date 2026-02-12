import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS, FONTS } from '../utils/constants'; // Assuming these exist
import { moderateScale, verticalScale } from '../utils/responsive'; // Assuming these exist

const HelpSupportScreen = () => {
  const navigation = useNavigation();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:mainstreetroofing604@gmail.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+16047204313'); // Replace with actual support number
  };

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'You can reset your password from the login screen by tapping on "Forgot Password?". Follow the instructions sent to your email.',
    },
    {
      question: 'How can I track my service request?',
      answer:
        'Go to the "My Jobs" or "Leads" section in your dashboard to view the status of your current requests.',
    },
    {
      question: 'Can I change my profile information?',
      answer:
        'Yes, navigate to your Profile tab and tap the "Edit" button to update your personal details.',
    },
    {
      question: 'Who do I contact for emergency repairs?',
      answer:
        'For urgent matters, please call our support line directly using the "Call Support" button above.',
    },
  ];

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionDescription}>
            Need assistance? Our support team is here to help you.
          </Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactCard, { marginRight: moderateScale(10) }]}
              onPress={handleCallSupport}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactLabel}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { marginLeft: moderateScale(10) }]}
              onPress={handleEmailSupport}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactLabel}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
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
  sectionDescription: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginBottom: verticalScale(16),
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  contactIcon: {
    fontSize: moderateScale(32),
    marginBottom: verticalScale(8),
  },
  contactLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.primary || '#007bff',
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    ...SHADOWS.small,
  },
  faqQuestion: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: verticalScale(6),
  },
  faqAnswer: {
    fontSize: moderateScale(13),
    color: COLORS.textLight,
    lineHeight: verticalScale(20),
  },
});

export default HelpSupportScreen;
