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
  ImageBackground,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

import Input from '../components/Input';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import ImagePicker from '../components/ImagePicker';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { api } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

// Mapped service types with images
const serviceTypes = [
  { id: 'repair', label: 'Roof Repair', image: require('../../assets/Repai.jpg') },
  { id: 'new', label: 'New Installation', image: require('../../assets/New-construction.jpg') },
  { id: 'replace', label: 'Replacement', image: require('../../assets/Reroofs-New.jpg') },
  { id: 'gutter', label: 'Gutter Services', image: require('../../assets/Rain.jpg') },
  { id: 'inspect', label: 'Inspection', image: require('../../assets/ab-roof-chimney.jpg') },
  { id: 'skylight', label: 'Skylight', image: require('../../assets/ab-roof-window.jpg') },
  { id: 'storm', label: 'Storm Damage', image: require('../../assets/flat-roofing.jpg') },
  { id: 'emergency', label: 'Emergency', image: require('../../assets/flat-roofing.jpg') }, // Reusing for now
  { id: 'commercial', label: 'Commercial', image: require('../../assets/Epdm.jpg') },
];

const ClientQuoteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    serviceType: route.params?.serviceType || '',
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

      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          payload.append(key, formData[key]);
        }
      });

      payload.append('leadType', 'quote');
      payload.append('source', 'mobile_app');

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
    } catch (error) {
      console.log('Submit error:', error?.response || error);
      Alert.alert('Error', 'Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
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
                            currentStep === step && styles.stepCircleCurrent
                        ]}
                     >
                         <Text style={[
                             styles.stepText,
                             currentStep >= step && styles.stepTextActive
                         ]}>
                             {step}
                         </Text>
                     </View>
                     <Text style={[
                         styles.stepLabel, 
                         currentStep >= step && styles.stepLabelActive
                     ]}>
                         {step === 1 ? 'Contact' : step === 2 ? 'Service' : 'Details'}
                     </Text>
                </View>
                {step < 3 && (
                    <View style={[
                        styles.stepLine,
                        currentStep > step && styles.stepLineActive
                    ]} />
                )}
            </React.Fragment>
        ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Contact Details</Text>
      <Text style={styles.stepSubHeader}>We need these to contact you with your quote.</Text>
      
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

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Property & Service</Text>
      <Text style={styles.stepSubHeader}>Where and what can we help you with?</Text>

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
      {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
      
      <View style={styles.servicesGrid}>
          {serviceTypes.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                    styles.serviceCard,
                    formData.serviceType === item.label && styles.serviceCardSelected
                ]}
                onPress={() => handleInputChange('serviceType', item.label)}
                activeOpacity={0.8}
              >
                  <ImageBackground 
                    source={item.image} 
                    style={styles.serviceImage}
                    imageStyle={{ borderRadius: moderateScale(12) }}
                  >
                      <View style={[
                          styles.serviceOverlay,
                          formData.serviceType === item.label && styles.serviceOverlaySelected
                        ]}>
                          <Text style={styles.serviceText}>{item.label}</Text>
                          {formData.serviceType === item.label && (
                              <View style={styles.checkIcon}>
                                  <Text style={{color: COLORS.white}}>✓</Text>
                              </View>
                          )}
                      </View>
                  </ImageBackground>
              </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Project Details</Text>
      <Text style={styles.stepSubHeader}>Help us understand the scope of work.</Text>

      <Input
        label="Description of Issue"
        placeholder="Describe the problem, roof age, leak location, etc."
        multiline
        numberOfLines={5}
        value={formData.description}
        onChangeText={val => handleInputChange('description', val)}
        error={errors.description}
      />

       <View style={styles.dateSection}>
          <Text style={styles.inputLabel}>Preferred Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={[styles.dateText, !formData.preferredDate && { color: COLORS.textLight }]}>
                {formData.preferredDate ? formatDisplayDate(selectedDate) : 'Select a date'}
            </Text>
            {formData.preferredDate && (
                <TouchableOpacity onPress={clearDate} style={{ padding: 5 }}>
                    <Text style={{ color: COLORS.textLight }}>✕</Text>
                </TouchableOpacity>
            )}
          </TouchableOpacity>
       </View>

        {/* Date Picker Modal logic same as before (omitted for brevity, using existing logic) */}
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
                  textColor="black"
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

       <Text style={[styles.inputLabel, { marginTop: verticalScale(16) }]}>Photos (Optional)</Text>
       <ImagePicker
            images={images}
            onImagesChange={setImages}
            maxImages={5}
       />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                 <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request a Quote</Text>
            <View style={{ width: 30 }} />
        </View>

        {/* Progress */}
        <ProgressSteps />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.footer}>
             <Button
                title={currentStep === 3 ? "Submit Request" : "Next Step →"}
                onPress={currentStep === 3 ? handleSubmit : handleNext}
                loading={loading}
                size="large"
             />
        </View>

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
  servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: verticalScale(10),
  },
  serviceCard: {
      width: '48%',
      aspectRatio: 1.3,
      marginBottom: verticalScale(16),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      ...SHADOWS.small,
      backgroundColor: COLORS.white,
      borderWidth: 2,
      borderColor: 'transparent',
  },
  serviceCardSelected: {
      borderColor: COLORS.primary,
  },
  serviceImage: {
      flex: 1,
  },
  serviceOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  serviceOverlaySelected: {
      backgroundColor: 'rgba(33, 150, 243, 0.6)', // Primary color overlay
  },
  serviceText: {
      color: COLORS.white,
      fontWeight: '700',
      fontSize: moderateScale(16),
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowRadius: 4,
  },
  checkIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: COLORS.success,
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.white,
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
      paddingBottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
  },
  // Date Picker Modal styles (copied from original)
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
