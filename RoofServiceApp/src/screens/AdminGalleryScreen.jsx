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
import Button from '../components/Button';
import { api, SERVER_URL } from '../config/api';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const AdminGalleryScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const [viewMode, setViewMode] = useState('folders'); // folders, subfolders, gallery
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const getImageUrl = path => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
  };

  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (viewMode === 'folders') {
      loadFolders();
    } else if (viewMode === 'subfolders') {
      loadCategories();
    } else if (viewMode === 'gallery') {
      loadGallery();
    }
  }, [viewMode, selectedLocation, selectedCategory]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const res = await api.getGalleryFolders();
      setLocations(res.data || []);
    } catch (error) {
      console.log('Load folders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getGalleryCategories({
        location: selectedLocation,
      });
      setCategories(res.data || []);
    } catch (error) {
      console.log('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await api.getGallery({
        location: selectedLocation,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      });
      const raw = res.data?.items || res.data || [];
      setItems(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.log('Load gallery error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('');
    setLocation('');
    setSelectedImage(null);
  };

  const openCreateForm = () => {
    resetForm();
    // Pre-fill with current selection if possible
    if (selectedLocation) setLocation(selectedLocation);
    if (selectedCategory && selectedCategory !== 'All')
      setCategory(selectedCategory);
    setShowForm(true);
  };

  const startEdit = item => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCategory(item.category || '');
    setLocation(item.location || '');
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
    if (!title.trim() || !location.trim() || !category.trim()) {
      Alert.alert('Validation', 'Title, Location and Category are required');
      return;
    }

    if (!editingItem && !selectedImage) {
      Alert.alert('Validation', 'Image is required for new items');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category.trim());
      formData.append('location', location.trim());

      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.name,
        });
      }

      if (editingItem) {
        await api.updateGalleryItem(editingItem.id, formData);
      } else {
        await api.createGalleryItem(formData);
      }

      await onRefresh();
      resetForm();
      setShowForm(false);
      Alert.alert('Success', 'Gallery item saved successfully');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save item';
      console.log('Save gallery error:', error);
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = async () => {
    if (viewMode === 'folders') loadFolders();
    else if (viewMode === 'subfolders') loadCategories();
    else loadGallery();
  };

  const handleDelete = itemToDelete => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${itemToDelete.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteGalleryItem(itemToDelete.id);
              await onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ],
    );
  };

  const handleBack = () => {
    if (viewMode === 'gallery') {
      setViewMode('subfolders');
      setSelectedCategory(null);
    } else if (viewMode === 'subfolders') {
      setViewMode('folders');
      setSelectedLocation(null);
    } else {
      navigation.goBack();
    }
  };

  const renderFolderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.folderCard}
      onPress={() => {
        setSelectedLocation(item.name);
        setViewMode('subfolders');
      }}
    >
      <View style={styles.folderIconContainer}>
        <Text style={styles.folderIcon}>📁</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.count}</Text>
        </View>
      </View>
      <Text style={styles.folderName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.folderSub}>{item.count} photos</Text>
    </TouchableOpacity>
  );

  const renderSubfolderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.folderCard}
      onPress={() => {
        setSelectedCategory(item);
        setViewMode('gallery');
      }}
    >
      <View style={styles.folderIconContainer}>
        <Text style={styles.folderIcon}>📂</Text>
      </View>
      <Text style={styles.folderName} numberOfLines={1}>
        {item}
      </Text>
      <Text style={styles.folderSub}>View images</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setViewingItem(item)}>
          <Image
            source={{ uri: getImageUrl(item.imageUrl) }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.category}>
              {item.category} • {item.location}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => startEdit(item)}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {viewMode === 'folders'
            ? 'Manage Gallery'
            : selectedCategory || selectedLocation}
        </Text>
        <TouchableOpacity onPress={openCreateForm} style={styles.addBtn}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          viewMode === 'folders'
            ? locations
            : viewMode === 'subfolders'
            ? categories
            : items
        }
        keyExtractor={(item, index) =>
          typeof item === 'string'
            ? item
            : String(item.id || item.name || index)
        }
        renderItem={
          viewMode === 'folders'
            ? renderFolderItem
            : viewMode === 'subfolders'
            ? renderSubfolderItem
            : renderItem
        }
        numColumns={viewMode === 'gallery' ? 1 : 2}
        key={viewMode} // Force re-render on grid change
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          viewMode !== 'folders' && (
            <Text style={styles.breadcrumb}>
              Gallery › {selectedLocation}{' '}
              {selectedCategory ? `› ${selectedCategory}` : ''}
            </Text>
          )
        }
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No items found.</Text>
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
                <Image
                  source={{ uri: getImageUrl(viewingItem.imageUrl) }}
                  style={styles.detailImage}
                  resizeMode="contain"
                />
                <Text style={styles.detailTitle}>{viewingItem.title}</Text>
                <Text style={styles.detailCategory}>
                  {viewingItem.category}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit/Create Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? 'Edit Item' : 'New Item'}
                </Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Project Title"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="e.g. Houston, Austin..."
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={category}
                    onChangeText={setCategory}
                    placeholder="e.g. Shingle, Metal..."
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Image</Text>
                  <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={handleChooseImage}
                  >
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.previewImage}
                      />
                    ) : editingItem ? (
                      <Image
                        source={{
                          uri: getImageUrl(editingItem.imageUrl), // Updated to use helper
                        }}
                        style={styles.previewImage}
                      />
                    ) : (
                      <Text style={styles.imagePlaceholder}>Select Image</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <Button
                  title="Save Item"
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
  breadcrumb: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  folderCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  folderIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F0F7FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  folderIcon: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  folderName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  folderSub: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  cardImage: { width: '100%', height: 180 },
  cardContent: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  category: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  editBtn: { padding: 8 },
  editIcon: { fontSize: 18, color: COLORS.textLight },
  deleteBtn: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deleteText: { color: COLORS.error, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textLight },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  detailContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    ...SHADOWS.large,
    alignSelf: 'center',
  },
  detailImage: {
    width: '100%',
    height: verticalScale(300),
    borderRadius: 12,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  detailCategory: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 8,
  },
  keyboardView: { flex: 1, justifyContent: 'center' },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
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

export default AdminGalleryScreen;
