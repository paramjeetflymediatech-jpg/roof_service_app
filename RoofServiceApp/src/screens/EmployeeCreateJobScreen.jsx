import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { api } from '../config/api';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const EmployeeCreateJobScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    serviceType: '',
    notes: '',
  });
  const [images, setImages] = useState([]);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setLoadingServices(false);
    }
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const pickFromLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });
    if (result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
    });
    if (result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    const next = [...images];
    next.splice(index, 1);
    setImages(next);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Validation', 'Client name is required.');
    if (!form.address.trim()) return Alert.alert('Validation', 'Address is required.');
    if (!form.serviceType.trim()) return Alert.alert('Validation', 'Please select or enter a service type.');

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address);
      formData.append('phone', form.phone);
      formData.append('serviceType', form.serviceType);
      formData.append('notes', form.notes);

      images.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `photo_${index}.jpg`,
        });
      });

      const response = await api.createSelfJob(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data?.success) {
        Alert.alert(
          'Success',
          'Job created and started successfully!',
          [
            {
              text: 'Go to Job',
              onPress: () => {
                const jobData = response.data.data;
                // Map the response to the format expected by JobDetail
                const mappedJob = {
                  id: String(jobData.id),
                  leadId: jobData.leadId,
                  service: jobData.lead?.serviceType || jobData.serviceType || 'Roof Service',
                  address: jobData.lead?.address || 'N/A',
                  clientName: jobData.lead?.name || 'Client',
                  phone: jobData.lead?.phone || 'N/A',
                  status: jobData.status,
                  date: new Date(jobData.createdAt).toLocaleDateString(),
                  preferredDate: jobData.scheduledDate ? new Date(jobData.scheduledDate).toLocaleDateString() : '',
                  rawDate: jobData.scheduledDate,
                  notes: jobData.notes || '',
                  lead: jobData.lead,
                  inTime: jobData.lead?.employeeStartTime || (jobData.lead?.inTime ? new Date(jobData.lead.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null),
                };
                navigation.replace('EmployeeJobDetail', { job: mappedJob });
              },
            },
          ]
        );
      }
    } catch (e) {
      console.log('Save job error:', e?.response?.data || e.message);
      Alert.alert('Error', e?.response?.data?.message || 'Could not create job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : verticalScale(16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Job</Text>
        <View style={{ width: moderateScale(60) }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client & Location</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Client Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={v => setField('name', v)}
              placeholder="Full name"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={form.address}
              onChangeText={v => setField('address', v)}
              placeholder="Service address"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={v => setField('phone', v)}
              placeholder="604-000-0000"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Service Type *</Text>
            <TextInput
              style={styles.input}
              value={form.serviceType}
              onChangeText={v => setField('serviceType', v)}
              placeholder="e.g. Roof Repair, Inspection"
              placeholderTextColor={COLORS.textLight}
            />
            
            {loadingServices ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceChips}>
                {services.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.chip, form.serviceType === s.name && styles.chipActive]}
                    onPress={() => setField('serviceType', s.name)}
                  >
                    <Text style={[styles.chipText, form.serviceType === s.name && styles.chipTextActive]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={form.notes}
              onChangeText={v => setField('notes', v)}
              placeholder="Additional details about the job..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before Photos</Text>
          <Text style={styles.subLabel}>Upload 1-5 photos showing the roof before work starts.</Text>
          
          <View style={styles.imageGrid}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                  <Text style={styles.removeImgText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <View style={styles.imagePickersRow}>
                <TouchableOpacity style={styles.addImgBtn} onPress={takePhoto}>
                  <Text style={styles.addImgIcon}>📸</Text>
                  <Text style={styles.addImgText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addImgBtn} onPress={pickFromLibrary}>
                  <Text style={styles.addImgIcon}>🖼️</Text>
                  <Text style={styles.addImgText}>Library</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSave} 
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Create & Start Job</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: verticalScale(30) }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.white,
    paddingBottom: verticalScale(16),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { width: moderateScale(60) },
  backText: { color: COLORS.text, fontSize: moderateScale(14), fontWeight: '600' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: moderateScale(16) },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    ...SHADOWS.small,
  },
  sectionTitle: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text, marginBottom: verticalScale(12) },
  field: { marginBottom: verticalScale(12) },
  label: { fontSize: moderateScale(12), fontWeight: '600', color: COLORS.textLight, marginBottom: verticalScale(4), textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(10),
    fontSize: moderateScale(14), color: COLORS.text, backgroundColor: '#FAFAFA',
  },
  inputMulti: { minHeight: verticalScale(70), textAlignVertical: 'top' },
  serviceChips: { flexDirection: 'row', marginTop: verticalScale(8) },
  chip: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F5F5F5',
    marginRight: moderateScale(8),
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: moderateScale(12), color: COLORS.textLight, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginBottom: verticalScale(10),
    ...SHADOWS.medium,
    marginTop: verticalScale(10),
  },
  saveBtnText: { color: COLORS.white, fontSize: moderateScale(15), fontWeight: '700' },
  cancelBtn: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textLight, fontSize: moderateScale(14), fontWeight: '600' },
  subLabel: { fontSize: moderateScale(12), color: COLORS.textLight, marginBottom: verticalScale(12) },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(10) },
  imageWrapper: { width: moderateScale(80), height: moderateScale(80), borderRadius: moderateScale(8), overflow: 'hidden', backgroundColor: '#eee' },
  imageThumb: { width: '100%', height: '100%' },
  removeImgBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeImgText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  imagePickersRow: { flexDirection: 'row', gap: moderateScale(10) },
  addImgBtn: { 
    width: moderateScale(80), height: moderateScale(80), borderRadius: moderateScale(8), 
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', 
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' 
  },
  addImgIcon: { fontSize: 24, marginBottom: 4 },
  addImgText: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
});

export default EmployeeCreateJobScreen;
