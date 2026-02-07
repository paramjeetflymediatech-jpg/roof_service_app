import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import ImagePicker from '../components/ImagePicker';
import { COLORS } from '../utils/constants';
import { api } from '../config/api';

const serviceTypes = [
  { id: 'repair', label: 'Roof Repair', icon: '🔧' },
  { id: 'new', label: 'New Installation', icon: '🏠' },
  { id: 'replace', label: 'Replacement', icon: '🔄' },
  { id: 'gutter_clean', label: 'Gutter Cleaning', icon: '🍂' },
  { id: 'gutter_install', label: 'Gutter Install', icon: '💧' },
  { id: 'storm', label: 'Storm Damage', icon: '⛈️' },
  { id: 'inspect', label: 'Inspection', icon: '🔍' },
  { id: 'maintain', label: 'Maintenance', icon: '🛠️' },
  { id: 'other', label: 'Other', icon: '📝' },
];

const ClientQuoteScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    serviceType: '',
    description: '',
    preferredDate: '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
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
    if (!formData.description)
      newErrors.description = 'Please describe the work needed';
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

      // text fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          payload.append(key, formData[key]);
        }
      });

      // required backend fields
      payload.append('leadType', 'quote');
      payload.append('source', 'mobile_app');

      // images
      images.forEach((img, index) => {
        payload.append('images', {
          uri: img.uri,
          name: img.fileName || `image_${index}.jpg`,
          type: img.type || 'image/jpeg',
        });
      });

      await api.createLead(payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert(
        '✅ Quote Submitted!',
        'Thank you! We will review your request and contact you within 24 hours.',
        [
          {
            text: 'Done',
            onPress: () => {
              setFormData({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: '',
                city: '',
                serviceType: '',
                description: '',
                preferredDate: '',
              });
              setImages([]);
              setCurrentStep(1);
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.log('Submit error:', error?.response || error);
      Alert.alert('Error', 'Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>
      <View style={styles.stepsIndicator}>
        {[1, 2, 3].map(step => (
          <View
            key={step}
            style={[
              styles.stepDot,
              currentStep >= step && styles.stepDotActive,
            ]}
          >
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive,
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Contact</Text>
        <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Service</Text>
        <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Details</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>📋 Contact Information</Text>
      <Text style={styles.stepSubtitle}>Let us know how to reach you</Text>

      <View style={styles.inputGroup}>
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChangeText={value => handleInputChange('name', value)}
          error={errors.name}
        />

        <Input
          label="Email Address"
          placeholder="john@example.com"
          value={formData.email}
          onChangeText={value => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Phone Number"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChangeText={value => handleInputChange('phone', value)}
          keyboardType="phone-pad"
          maxLength={15}
          error={errors.phone}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>🏠 Service & Location</Text>
      <Text style={styles.stepSubtitle}>What do you need help with?</Text>

      <View style={styles.inputGroup}>
        <Input
          label="Property Address"
          placeholder="123 Main Street"
          value={formData.address}
          onChangeText={value => handleInputChange('address', value)}
          error={errors.address}
        />

        <Input
          label="City"
          placeholder="Your City"
          value={formData.city}
          onChangeText={value => handleInputChange('city', value)}
        />

        <View style={styles.serviceSection}>
          <Text style={styles.label}>Select Service Type</Text>
          {errors.serviceType && (
            <Text style={styles.errorText}>{errors.serviceType}</Text>
          )}
          <View style={styles.serviceGrid}>
            {serviceTypes.map(service => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  formData.serviceType === service.label &&
                    styles.serviceCardSelected,
                ]}
                onPress={() => handleInputChange('serviceType', service.label)}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text
                  style={[
                    styles.serviceLabel,
                    formData.serviceType === service.label &&
                      styles.serviceLabelSelected,
                  ]}
                >
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>📝 Project Details</Text>
      <Text style={styles.stepSubtitle}>Tell us more about your project</Text>

      <View style={styles.inputGroup}>
        <Input
          label="Describe the Work Needed"
          placeholder="Please describe the issue or work you need done. Include any relevant details like roof age, visible damage, urgency, etc."
          value={formData.description}
          onChangeText={value => handleInputChange('description', value)}
          multiline
          numberOfLines={5}
          error={errors.description}
        />

        <View style={styles.datePickerSection}>
          <Text style={styles.label}>Preferred Date (Optional)</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerIcon}>📅</Text>
            <Text style={[
              styles.datePickerText,
              !formData.preferredDate && styles.datePickerPlaceholder
            ]}>
              {formData.preferredDate 
                ? formatDisplayDate(selectedDate)
                : 'Select a date'
              }
            </Text>
            {formData.preferredDate && (
              <TouchableOpacity
                onPress={clearDate}
                style={styles.dateClearButton}
              >
                <Text style={styles.dateClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal for iOS */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
          >
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
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Date Picker for Android */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.imageSection}>
          <Text style={styles.imageSectionTitle}>📷 Add Photos (Optional)</Text>
          <Text style={styles.imageSectionSubtitle}>
            Photos help us provide a more accurate quote
          </Text>
          <ImagePicker
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Quote</Text>
          <View style={styles.headerRight}>
            <BrandLogo
              imageStyle={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {renderProgressBar()}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {currentStep < 3 ? (
            <Button
              title={`Continue →`}
              onPress={handleNext}
              style={styles.actionButton}
            />
          ) : (
            <Button
              title="Submit Quote Request"
              onPress={handleSubmit}
              loading={loading}
              style={styles.actionButton}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ClientQuoteScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 60,
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    width: 70,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  serviceSection: {
    marginTop: 8,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f7ff',
  },
  serviceIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  serviceLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 8,
  },
  imageSection: {
    marginTop: 16,
  },
  imageSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  imageSectionSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  datePickerSection: {
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  datePickerPlaceholder: {
    color: COLORS.textLight,
  },
  dateClearButton: {
    padding: 4,
  },
  dateClearText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateModalCancel: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  dateModalDone: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    marginTop: 0,
  },
});
