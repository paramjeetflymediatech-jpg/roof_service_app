import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import Button from '../components/Button';

// Local assets for services
// Using existing assets from the project
const SERVICES = [
  {
    id: '1',
    title: 'Roof Repair',
    quoteLabel: 'Roof Repair',
    description:
      'Leak fixes, shingle replacement, and extending your roof’s lifespan.',
    image: require('../../assets/Repai.jpg'), // Ensure this exists
  },
  {
    id: '2',
    title: 'Full Replacement',
    quoteLabel: 'Replacement', 
    description:
      'Complete removal and installation of high-quality new roofing systems.',
    image: require('../../assets/Reroofs-New.jpg'), // Ensure this exists
  },
  {
    id: '3',
    title: 'Professional Inspection',
    quoteLabel: 'Inspection',
    description:
      'Detailed assessment to catch issues before they become costly.',
    image: require('../../assets/ab-roof-chimney.jpg'), // Using chimney/roof detail
  },
  {
    id: '4',
    title: 'Gutter Services',
    quoteLabel: 'Gutter Cleaning',
    description:
      'Cleaning, repair, and seamless installation for perfect drainage.',
    image: require('../../assets/Rain.jpg'), // Using rain/gutter related image
  },
  {
    id: '5',
    title: 'Skylight Installation',
    quoteLabel: 'Skylight Installation',
    description:
      'Bring natural light into your home with energy-efficient skylights.',
    image: require('../../assets/ab-roof-window.jpg'), // Using window image
  },
  {
    id: '6',
    title: '24/7 Emergency',
    quoteLabel: 'Emergency Repair',
    description:
      'Rapid response for storm damage, fallen trees, and urgent leaks.',
    image: require('../../assets/flat-roofing.jpg'),
  },
];

const ClientServicesScreen = () => {
  const navigation = useNavigation();

  const handleGetQuote = (quoteLabel) => {
    navigation.navigate('ClientQuote', { serviceType: quoteLabel });
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => handleGetQuote(item.quoteLabel)}
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={{ borderRadius: moderateScale(20) }}
      >
        <View style={styles.cardOverlay}>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
          <View style={styles.buttonContainer}>
             <Text style={styles.ctaText}>Get Quote →</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={SERVICES}
        keyExtractor={item => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    padding: moderateScale(8),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    ...SHADOWS.small,
  },
  backButtonText: {
    fontSize: moderateScale(20),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: COLORS.text,
  },
  listContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(40),
  },
  cardContainer: {
    height: verticalScale(220),
    marginBottom: verticalScale(24),
    borderRadius: moderateScale(20),
    ...SHADOWS.medium,
    backgroundColor: COLORS.white, // Fallback
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)', // Darker overlay for better text contrast
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    height: '100%',
    justifyContent: 'flex-end',
  },
  textContainer: {
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: verticalScale(4),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cardDescription: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.95)',
    lineHeight: verticalScale(20),
    paddingRight: moderateScale(20),
    fontWeight: '500',
  },
  buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  ctaText: {
      color: COLORS.white, // Use a bright accent if possible, or white
      fontWeight: '700',
      fontSize: moderateScale(16),
      textDecorationLine: 'underline',
  },
});

export default ClientServicesScreen;
