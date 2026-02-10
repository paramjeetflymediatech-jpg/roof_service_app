import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import { api, SERVER_URL } from '../config/api';

const ClientServicesScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await api.getServices();
      const raw = res.data?.items || res.data || [];
      setServices(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.log('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = quoteLabel => {
    navigation.navigate('ClientQuote', { serviceType: quoteLabel });
  };
  const getImageSource = item => {
    // If item has a featured image from backend
    if (item.featuredImageUrl) {
      return {
        uri: item.featuredImageUrl.startsWith('http')
          ? item.featuredImageUrl
          : `${SERVER_URL}${item.featuredImageUrl}`,
      };
    }
    // Fallback images based on slug or name
    if (item.slug?.includes('repair')) return require('../../assets/Repai.jpg');
    if (item.slug?.includes('metal'))
      return require('../../assets/Reroofs-New.jpg');

    // Default fallback
    return require('../../assets/roofing-background.jpg');
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => handleGetQuote(item.name)}
    >
      <ImageBackground
        source={getImageSource(item)}
        style={styles.cardImage}
        imageStyle={{ borderRadius: moderateScale(20) }}
      >
        <View style={styles.cardOverlay}>
          <View style={styles.textContainer}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <Text style={styles.cardDescription}>{item.shortDescription}</Text>
            {item.basePrice && (
              <Text style={styles.priceTag}>Starting at ${item.basePrice}</Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Text style={styles.ctaText}>Get Quote →</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
        data={services}
        keyExtractor={item => String(item.id)}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No services available.
          </Text>
        }
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
    backgroundColor: 'rgba(0,0,0,0.5)', // Darker overlay for better text contrast
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
    // marginBottom: verticalScale(4),
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
    marginTop: 4,
  },
  priceTag: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 4,
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
