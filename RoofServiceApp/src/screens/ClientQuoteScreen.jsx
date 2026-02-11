import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

import Input from '../components/Input';
import Button from '../components/Button';
import ImagePicker from '../components/ImagePicker';
import { COLORS, SHADOWS } from '../utils/constants';
import { api, SERVER_URL } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

// Fallback images if no image is provided from backend
const FALLBACK_IMAGE = require('../../assets/roofing-background.jpg');

const ClientQuoteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  // Check if we are editing an existing quote
  const { lead, isEditing } = route.params || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    serviceType: route.params?.serviceType || '',
    message: '',
    preferredDate: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    loadServices();
    if (isEditing && lead) {
      populateForm(lead);
    }
  }, [isEditing, lead]);
  const populateForm = data => {
    setFormData({
      name: data.name || user?.name || '',
      email: data.email || user?.email || '',
      phone: data.phone || user?.phone || '',
      address: data.address || user?.address || '',
      city: data.city || user?.city || '',
      serviceType: data.serviceType || '',
      message: data.message || data.description || '',
      preferredDate: data.preferredDate ? data.preferredDate.split('T')[0] : '',
    });
    // Handle Date Object for picker
    if (data.preferredDate) {
      const d = new Date(data.preferredDate);
      if (!Number.isNaN(d.getTime())) {
        setSelectedDate(d);
      }
    }
    // Pre-fill existing images
    let imagesToSet = [];
    if (Array.isArray(data.clientImages)) {
      imagesToSet = data.clientImages;
    } else if (typeof data.clientImages === 'string') {
      try {
        const parsed = JSON.parse(data.clientImages);
        if (Array.isArray(parsed)) imagesToSet = parsed;
      } catch (e) {
        console.log('Failed to parse clientImages', e);
      }
    }
    setExistingImages(imagesToSet);
  };
  const loadServices = async () => {
    try {
      const res = await api.getServices();
      const raw = res.data?.items || res.data || [];
      const services = Array.isArray(raw) ? raw : [];
      setServiceTypes(services);
    } catch (error) {
      console.log('Error fetching services for quote:', error);
      Alert.alert(
        'Error',
        'Could not load services. Please check your connection.',
      );
    } finally {
      setFetchingServices(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = date => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      handleInputChange('preferredDate', formatDate(date));
    }
  };

  const confirmDate = () => {
    handleInputChange('preferredDate', formatDate(selectedDate));
    setShowDatePicker(false);
  };

  const clearDate = () => {
    handleInputChange('preferredDate', '');
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.serviceType)
      newErrors.serviceType = 'Please select a service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.message)
      newErrors.message = 'Please describe the work needed';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const payload = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          payload.append(key, formData[key]);
        }
      });

      if (!isEditing) {
        payload.append('leadType', 'quote');
        payload.append('source', 'mobile_app');
      }

      images.forEach((img, index) => {
        payload.append('images', {
          uri: img.uri,
          name: img.fileName || `image_${index}.jpg`,
          type: img.type || 'image/jpeg',
        });
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditing) {
        // Send kept images as JSON string
        payload.append('keptImages', JSON.stringify(existingImages));

        await api.updateMyLead(lead.id, payload, config);
        Alert.alert(
          '✅ Quote Updated!',
          'Your quote request has been updated successfully.',
          [
            {
              text: 'Back to My Quotes',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        await api.createLead(payload, config);
        Alert.alert(
          '✅ Quote Submitted!',
          'Thank you! We will review your request and get back to you shortly.',
          [
            {
              text: 'Return Home',
              onPress: () => {
                navigation.navigate('ClientHome');
              },
            },
          ],
        );
      }
    } catch (error) {
      console.log('Submit error:', error?.response || error);
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'submit'} quote. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = indexToRemove => {
    setExistingImages(prev =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const getServiceImageSource = item => {
    if (item.featuredImageUrl) {
      return {
        uri: item.featuredImageUrl.startsWith('http')
          ? item.featuredImageUrl
          : `${SERVER_URL}${item.featuredImageUrl}`,
      };
    }
    return FALLBACK_IMAGE;
  };

  const ProgressSteps = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
                currentStep === step && styles.stepCircleCurrent,
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  currentStep >= step && styles.stepTextActive,
                ]}
              >
                {step}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep >= step && styles.stepLabelActive,
              ]}
            >
              {step === 1 ? 'Contact' : step === 2 ? 'Service' : 'Details'}
            </Text>
          </View>
          {step < 3 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Contact Details</Text>
      <Text style={styles.stepSubHeader}>
        We need these to contact you with your quote.
      </Text>

      <Input
        label="Full Name"
        placeholder="Enter your name"
        value={formData.name}
        onChangeText={val => handleInputChange('name', val)}
        error={errors.name}
      />
      <Input
        label="Email Address"
        placeholder="Enter your email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={val => handleInputChange('email', val)}
        error={errors.email}
      />
      <Input
        label="Phone Number"
        placeholder="(555) 123-4567"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={val => handleInputChange('phone', val)}
        error={errors.phone}
      />
    </View>
  );

  const renderStep2 = () => {
    const selectedService = serviceTypes.find(
      s => s.name === formData.serviceType,
    );

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeader}>Property & Service</Text>
        <Text style={styles.stepSubHeader}>
          Where and what can we help you with?
        </Text>

        <Input
          label="Property Address"
          placeholder="123 Main St"
          value={formData.address}
          onChangeText={val => handleInputChange('address', val)}
          error={errors.address}
        />

        <Input
          label="City"
          placeholder="City"
          value={formData.city}
          onChangeText={val => handleInputChange('city', val)}
          containerStyle={{ marginBottom: verticalScale(20) }}
        />

        <Text style={styles.inputLabel}>Select Service Needed</Text>
        {errors.serviceType && (
          <Text style={styles.errorText}>{errors.serviceType}</Text>
        )}

        {fetchingServices ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowServiceModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !formData.serviceType && { color: COLORS.textLight },
                ]}
              >
                {formData.serviceType || 'Select a Service...'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {selectedService && (
              <View style={styles.selectedServiceCard}>
                <Image
                  source={getServiceImageSource(selectedService)}
                  style={styles.selectedServiceImage}
                />
                <View style={styles.selectedServiceInfo}>
                  <Text style={styles.selectedServiceTitle}>
                    {selectedService.name}
                  </Text>
                  <Text style={styles.selectedServiceDesc}>
                    {selectedService.shortDescription}
                  </Text>
                  {selectedService.basePrice && (
                    <Text style={styles.selectedServicePrice}>
                      Starting at ${selectedService.basePrice}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Project Details</Text>
      <Text style={styles.stepSubHeader}>
        Help us understand the scope of work.
      </Text>

      <Input
        label="Description of Issue"
        placeholder="Describe the problem, roof age, leak location, etc."
        multiline
        numberOfLines={5}
        value={formData.message}
        onChangeText={val => handleInputChange('message', val)}
        error={errors.message}
      />

      <View style={styles.dateSection}>
        <Text style={styles.inputLabel}>Preferred Date (Optional)</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateIcon}>📅</Text>
          <Text
            style={[
              styles.dateText,
              !formData.preferredDate && { color: COLORS.textLight },
            ]}
          >
            {formData.preferredDate
              ? formatDisplayDate(selectedDate)
              : 'Select a date'}
          </Text>
          {formData.preferredDate && (
            <TouchableOpacity onPress={clearDate} style={{ padding: 5 }}>
              <Text style={{ color: COLORS.textLight }}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' && (
        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.dateModalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.dateModalTitle}>Select Date</Text>
                <TouchableOpacity onPress={confirmDate}>
                  <Text style={styles.dateModalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
                textColor="black"
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={[styles.inputLabel, { marginTop: verticalScale(16) }]}>
        {isEditing ? 'Add More Photos (Optional)' : 'Photos (Optional)'}
      </Text>

      {existingImages && existingImages.length > 0 && (
        <View style={styles.existingImagesContainer}>
          <Text style={styles.inputLabel}>Current Photos:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {existingImages.map((img, index) => {
              console.log(`${SERVER_URL}${img.url}`, 'img');
              const imageUrl = img.url.startsWith('http')
                ? img.url
                : `${SERVER_URL}${img.url}`;

              return (
                <View key={index} style={styles.existingImageWrapper}>
                  <Image
                    source={{
                      uri: imageUrl,
                    }}
                    style={styles.existingImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeExistingImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
      <ImagePicker images={images} onImagesChange={setImages} maxImages={5} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Quote' : 'Request a Quote'}
          </Text>
          <View style={{ width: moderateScale(30) }} />
        </View>

        <ProgressSteps />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={
              currentStep === 3
                ? isEditing
                  ? 'Update Quote'
                  : 'Submit Request'
                : 'Next Step →'
            }
            onPress={currentStep === 3 ? handleSubmit : handleNext}
            loading={loading}
            size="large"
          />
        </View>

        {/* Service Selection Modal */}
        <Modal
          visible={showServiceModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowServiceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select a Service</Text>
                <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={serviceTypes}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.serviceItem}
                    onPress={() => {
                      handleInputChange('serviceType', item.name);
                      setShowServiceModal(false);
                    }}
                  >
                    <Text style={styles.serviceItemText}>{item.name}</Text>
                    {formData.serviceType === item.name && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  backButton: {
    padding: moderateScale(8),
  },
  backButtonText: {
    fontSize: moderateScale(24),
    color: COLORS.text,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    backgroundColor: COLORS.white,
    marginBottom: verticalScale(10),
  },
  stepWrapper: {
    alignItems: 'center',
    width: moderateScale(60),
  },
  stepCircle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: COLORS.primary + '50', // light halo
  },
  stepText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.textLight,
  },
  stepTextActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepLine: {
    width: moderateScale(40),
    height: 2,
    backgroundColor: '#f0f0f0',
    marginTop: -verticalScale(14), // align with circles
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(100),
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(4),
  },
  stepSubHeader: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    marginBottom: verticalScale(24),
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    ...SHADOWS.small,
  },
  dropdownText: {
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  dropdownIcon: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
  },
  selectedServiceCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginBottom: verticalScale(20),
    ...SHADOWS.medium,
  },
  selectedServiceImage: {
    width: '100%',
    height: verticalScale(150),
    resizeMode: 'cover',
  },
  selectedServiceInfo: {
    padding: moderateScale(16),
  },
  selectedServiceTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(4),
  },
  selectedServiceDesc: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    lineHeight: verticalScale(20),
  },
  selectedServicePrice: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: verticalScale(8),
  },
  inputLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginBottom: verticalScale(8),
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  dateSection: {
    marginTop: verticalScale(10),
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
  },
  dateIcon: {
    fontSize: moderateScale(18),
    marginRight: moderateScale(10),
  },
  dateText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: moderateScale(20),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  existingImagesContainer: {
    marginBottom: verticalScale(16),
  },
  existingImageWrapper: {
    marginRight: moderateScale(12),
    position: 'relative',
  },
  existingImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  closeText: {
    fontSize: moderateScale(20),
    color: COLORS.textLight,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  serviceItemText: {
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: moderateScale(16),
  },
  checkmark: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
  },

  // Date Picker Modal styles (Keep original)
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: verticalScale(30),
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: COLORS.text,
  },
  dateModalCancel: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
  },
  dateModalDone: {
    fontSize: moderateScale(16),
    color: COLORS.primary,
    fontWeight: '600',
  },
  datePicker: {
    height: verticalScale(200),
  },
});

export default ClientQuoteScreen;
