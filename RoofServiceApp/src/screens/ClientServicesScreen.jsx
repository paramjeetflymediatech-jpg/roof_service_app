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
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import { api, SERVER_URL } from '../config/api';

const ClientServicesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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

  const openServiceModal = service => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleGetQuoteFromModal = () => {
    if (selectedService) {
      closeModal();
      handleGetQuote(selectedService.name);
    }
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
      onPress={() => openServiceModal(item)}
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
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : verticalScale(20) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Services</Text>
        <View style={{ width: moderateScale(40) }} />
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

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
              zIndex={10}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {selectedService && (
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={getImageSource(selectedService)}
                  style={styles.modalImage}
                  resizeMode="cover"
                />

                <View style={styles.modalDetails}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalIcon}>{selectedService.icon}</Text>
                    <Text style={styles.modalTitle}>
                      {selectedService.name}
                    </Text>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedService.description ||
                      selectedService.shortDescription}
                  </Text>

                  {selectedService.basePrice && (
                    <View style={styles.pricingSection}>
                      <Text style={styles.pricingLabel}>Starting Price</Text>
                      <Text style={styles.pricingValue}>
                        ${selectedService.basePrice}
                      </Text>
                    </View>
                  )}

                  {selectedService.whyChooseUs &&
                    Array.isArray(selectedService.whyChooseUs) &&
                    selectedService.whyChooseUs.length > 0 && (
                      <View style={styles.benefitsSection}>
                        <Text style={styles.benefitsTitle}>Why Choose Us</Text>
                        {selectedService.whyChooseUs.map((benefit, index) => (
                          <View key={index} style={styles.benefitItem}>
                            <Text style={styles.benefitBullet}>✓</Text>
                            <Text style={styles.benefitText}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                  <TouchableOpacity
                    style={styles.getQuoteButton}
                    onPress={handleGetQuoteFromModal}
                  >
                    <Text style={styles.getQuoteButtonText}>
                      Get a Free Quote
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    height: "auto",
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
    padding: moderateScale(15),
    height: '100%',
    justifyContent: 'flex-end',
  },
  textContainer: {
    marginBottom: verticalScale(12),
    backgroundColor: "rgb(0,0,0,0.5)",
    padding: moderateScale(5),
    borderRadius: moderateScale(10),
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
    color: COLORS.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    height: '90%',
    ...SHADOWS.large,
  },
  modalCloseButton: {
    position: 'absolute',
    top: verticalScale(20),
    right: moderateScale(20),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: moderateScale(20),
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: moderateScale(24),
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: verticalScale(250),
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  modalDetails: {
    padding: moderateScale(24),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  modalIcon: {
    fontSize: moderateScale(32),
    marginRight: moderateScale(12),
  },
  modalTitle: {
    fontSize: moderateScale(26),
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  modalDescription: {
    fontSize: moderateScale(15),
    color: COLORS.textLight,
    lineHeight: verticalScale(24),
    marginBottom: verticalScale(20),
  },
  pricingSection: {
    backgroundColor: COLORS.primary + '10',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
  },
  pricingLabel: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginBottom: verticalScale(4),
  },
  pricingValue: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.primary,
  },
  benefitsSection: {
    marginBottom: verticalScale(24),
  },
  benefitsTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  benefitBullet: {
    color: COLORS.primary,
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginRight: moderateScale(10),
  },
  benefitText: {
    flex: 1,
    fontSize: moderateScale(15),
    color: COLORS.text,
    lineHeight: verticalScale(22),
  },
  getQuoteButton: {
    backgroundColor: COLORS.primary,
    padding: moderateScale(18),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  getQuoteButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

export default ClientServicesScreen;
