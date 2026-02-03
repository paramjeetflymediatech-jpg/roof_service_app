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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Input from '../components/Input';
import Button from '../components/Button';
import ImagePicker from '../components/ImagePicker';
import { COLORS } from '../utils/constants';
import { api } from '../config/api';

const serviceTypes = [
  'Roof Repair',
  'New Roof Installation',
  'Roof Replacement',
  'Gutter Cleaning',
  'Gutter Installation',
  'Storm Damage Repair',
  'Roof Inspection',
  'Maintenance',
  'Other',
];

const ClientQuoteScreen = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    serviceType: '',
    description: '',
    preferredDate: '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.serviceType)
      newErrors.serviceType = 'Please select a service';
    if (!formData.description)
      newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
        'Success',
        'Your quote request has been submitted! We will contact you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                serviceType: '',
                description: '',
                preferredDate: '',
              });
              setImages([]);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Request a Quote</Text>
        <Text style={styles.subtitle}>
          Fill out the form below and we’ll get back to you within 24 hours.
        </Text>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={value => handleInputChange('name', value)}
            error={errors.name}
            minLength={2}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={value => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            maxLength={15}
            minLength={6}
            error={errors.phone}
          />

          <Input
            label="Address"
            placeholder="Enter your property address"
            value={formData.address}
            onChangeText={value => handleInputChange('address', value)}
            error={errors.address}
          />

          <Input
            label="City"
            placeholder="Enter your city"
            value={formData.city}
            onChangeText={value => handleInputChange('city', value)}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Service Type</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              {serviceTypes.map(service => (
                <TouchableOpacity
                  key={service}
                  style={[
                    styles.serviceChip,
                    formData.serviceType === service &&
                      styles.serviceChipSelected,
                  ]}
                  onPress={() => handleInputChange('serviceType', service)}
                >
                  <Text
                    style={[
                      styles.serviceChipText,
                      formData.serviceType === service &&
                        styles.serviceChipTextSelected,
                    ]}
                  >
                    {service}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {errors.serviceType && (
              <Text style={styles.errorText}>{errors.serviceType}</Text>
            )}
          </View>

          <Input
            label="Description"
            placeholder="Describe the work needed..."
            value={formData.description}
            onChangeText={value => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          <Input
            label="Preferred Date"
            placeholder="YYYY-MM-DD"
            value={formData.preferredDate}
            onChangeText={value => handleInputChange('preferredDate', value)}
          />

          <ImagePicker
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />

          <Button
            title="Submit Quote Request"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ClientQuoteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceChipSelected: {
    backgroundColor: COLORS.primary,
  },
  serviceChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  serviceChipTextSelected: {
    color: COLORS.white,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 12,
  },
});
