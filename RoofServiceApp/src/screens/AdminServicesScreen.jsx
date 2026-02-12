import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  Platform,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../App';
import Button from '../components/Button';
import { api, SERVER_URL } from '../config/api';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const AdminServicesScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [icon, setIcon] = useState(''); // Emoji or text icon
  const [selectedImage, setSelectedImage] = useState(null); // { uri, type, fileName }

  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);
  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.getServices();
      const raw = res.data?.items || res.data || [];
      setServices(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.log('Load services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setBasePrice('');
    setIcon('');
    setSelectedImage(null);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = s => {
    setEditingService(s);
    setName(s.name || '');
    setSlug(s.slug || '');
    setShortDescription(s.shortDescription || '');
    setBasePrice(s.basePrice ? String(s.basePrice) : '');
    setIcon(s.icon || '');
    setSelectedImage(null);
    setShowForm(true);
  };

  const handleChooseImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'upload.jpg',
      });
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('Validation', 'Name and Slug are required');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('slug', slug.trim());
      formData.append('shortDescription', shortDescription.trim());
      if (basePrice) formData.append('basePrice', basePrice);
      formData.append('icon', icon.trim());
      formData.append('status', 'published');

      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.name,
        });
      }

      if (editingService) {
        await api.updateService(editingService.id, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.createService(formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await loadServices();
      resetForm();
      setShowForm(false);
      Alert.alert('Success', 'Service saved successfully');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save service';
      console.log('Save service error:', error);
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = serviceToDelete => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete ${serviceToDelete.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteService(serviceToDelete.id);
              await loadServices();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ],
    );
  };

  const getImageUrl = path => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() => setViewingItem(item)}
      >
        <View style={styles.iconContainer}>
          {item.featuredImageUrl ? (
            <Image
              source={{ uri: getImageUrl(item.featuredImageUrl) }}
              style={styles.thumbnail}
            />
          ) : (
            <Text style={styles.iconText}>{item.icon || '🛠️'}</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.slug}>{item.slug}</Text>
          <Text style={styles.price}>
            {item.basePrice ? `$${item.basePrice}` : 'Custom Quote'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => startEdit(item)}
        >
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ... existing header and list ... */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services</Text>
        <TouchableOpacity onPress={handleOpenCreateForm} style={styles.addBtn}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={item => String(item.id)}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadServices}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No services found.</Text>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={!!viewingItem}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailContainer}>
            <TouchableOpacity
              onPress={() => setViewingItem(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {viewingItem && (
              <>
                {viewingItem.featuredImageUrl ? (
                  <Image
                    source={{ uri: getImageUrl(viewingItem.featuredImageUrl) }}
                    style={styles.detailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.detailImage,
                      {
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 50 }}>
                      {viewingItem.icon || '🛠️'}
                    </Text>
                  </View>
                )}
                <Text style={styles.detailTitle}>{viewingItem.name}</Text>
                <Text style={styles.detailPrice}>
                  {viewingItem.basePrice
                    ? `$${viewingItem.basePrice}`
                    : 'Custom Quote'}
                </Text>
                <ScrollView style={styles.detailScroll}>
                  <Text style={styles.detailDescription}>
                    {viewingItem.shortDescription ||
                      'No description available.'}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        {/* ... existing form ... */}
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingService ? 'Edit Service' : 'New Service'}
                </Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Service Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Roof Repair"
                  />
                </View>

                {/* Image Picker */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Featured Image</Text>
                  <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={handleChooseImage}
                  >
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.previewImage}
                      />
                    ) : editingService && editingService.featuredImageUrl ? (
                      <Image
                        source={{
                          uri: getImageUrl(editingService.featuredImageUrl),
                        }}
                        style={styles.previewImage}
                      />
                    ) : (
                      <Text style={styles.imagePlaceholder}>Select Image</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Slug (Unique ID)</Text>
                  <TextInput
                    style={styles.input}
                    value={slug}
                    onChangeText={setSlug}
                    placeholder="e.g. roof-repair"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Short Description</Text>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={shortDescription}
                    onChangeText={setShortDescription}
                    placeholder="Brief description..."
                    multiline
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Base Price ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={basePrice}
                    onChangeText={setBasePrice}
                    placeholder="e.g. 150.00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Icon (Emoji)</Text>
                  <TextInput
                    style={styles.input}
                    value={icon}
                    onChangeText={setIcon}
                    placeholder="e.g. 🏠"
                  />
                </View>

                <Button
                  title="Save Service"
                  onPress={handleSave}
                  loading={saving}
                  style={{ marginTop: 20 }}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  detailContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  detailImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: 12,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  detailPrice: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  detailScroll: {
    width: '100%',
    maxHeight: verticalScale(200),
  },
  detailDescription: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(34),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  backBtn: { padding: 10 },
  backText: { fontSize: 24, color: COLORS.text },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { color: COLORS.white, fontSize: 24, marginTop: -2 },
  listContent: { padding: moderateScale(20) },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  cardMain: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  iconText: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  slug: { fontSize: 12, color: COLORS.textLight },
  price: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  editBtn: { padding: 8 },
  editIcon: { fontSize: 18, color: COLORS.textLight },
  actions: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  deleteBtn: { padding: 12, alignItems: 'center', backgroundColor: '#fff0f0' },
  deleteText: { color: COLORS.error, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textLight },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: { flex: 1, justifyContent: 'center' },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeText: { fontSize: 24, color: COLORS.textLight },
  formGroup: { marginBottom: 16 },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: COLORS.textLight,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: { color: COLORS.textLight },
  previewImage: { width: '100%', height: '100%' },
});

export default AdminServicesScreen;
