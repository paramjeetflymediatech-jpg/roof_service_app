import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Modal,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import { api, SERVER_URL } from '../config/api';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - moderateScale(60)) / COLUMN_COUNT;

const ClientGalleryScreen = () => {
  const navigation = useNavigation();
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('folders');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (viewMode === 'folders') {
      loadFolders();
    } else if (viewMode === 'subfolders') {
      loadCategories();
    } else if (viewMode === 'gallery' && selectedLocation && selectedCategory) {
      setPage(1);
      fetchImages(1, true);
    }
  }, [viewMode, selectedLocation, selectedCategory]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const res = await api.getGalleryFolders();
      setLocations(res.data || []);
    } catch (error) {
      console.log('Error fetching folders:', error);
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
      console.log('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (pageNum, isInitial = false) => {
    if (pageNum > 1 && !hasMore) return;
    if (pageNum > 1) setLoadingMore(true);

    try {
      const res = await api.getGallery({
        location: selectedLocation,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        page: pageNum,
        limit: 20,
      });

      const { items, totalPages } = res.data;
      const newItems = Array.isArray(items) ? items : [];

      if (isInitial) {
        setGalleryItems(newItems);
      } else {
        setGalleryItems(prev => [...prev, ...newItems]);
      }

      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log('Error fetching images:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchImages(page + 1);
    }
  };

  const getImageUrl = path => {
    if (!path) return 'https://via.placeholder.com/300';
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
  };

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedImage(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.imageUrl) }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemOverlay}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.folderContainer}
      onPress={() => {
        setSelectedLocation(item.name);
        setViewMode('subfolders');
      }}
    >
      <View style={styles.folderIconContainer}>
        <Text style={styles.folderIcon}>📁</Text>
        <View style={styles.folderBadge}>
          <Text style={styles.folderBadgeText}>{item.count}</Text>
        </View>
      </View>
      <Text style={styles.folderName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSubfolderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.folderContainer}
      onPress={() => {
        setSelectedCategory(item);
        setViewMode('gallery');
      }}
    >
      <View style={styles.folderIconContainer}>
        <Text style={styles.folderIcon}>📂</Text>
      </View>
      <Text style={styles.folderName} numberOfLines={1}>
        {item === 'All' ? 'All Photos' : item}
      </Text>
    </TouchableOpacity>
  );

  const handleBack = () => {
    if (viewMode === 'gallery') {
      setViewMode('subfolders');
      setSelectedCategory('All');
    } else if (viewMode === 'subfolders') {
      setViewMode('folders');
      setSelectedLocation(null);
    } else {
      navigation.goBack();
    }
  };

  const onRefresh = async () => {
    if (viewMode === 'folders') {
      loadFolders();
    } else if (viewMode === 'subfolders') {
      loadCategories();
    } else {
      fetchImages(1, true);
    }
  };

  const renderContent = () => {
    if (viewMode === 'folders') {
      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={locations}
            keyExtractor={item => item.name}
            renderItem={renderFolderItem}
            numColumns={COLUMN_COUNT}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.sectionLabel}>Project Locations</Text>
            }
            ListEmptyComponent={
              !loading && (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>
                  No projects found.
                </Text>
              )
            }
          />
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        </View>
      );
    }

    if (viewMode === 'subfolders') {
      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={categories}
            keyExtractor={item => item}
            renderItem={renderSubfolderItem}
            numColumns={COLUMN_COUNT}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.sectionLabel}>
                Work Categories in {selectedLocation}
              </Text>
            }
            ListEmptyComponent={
              !loading && (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>
                  No categories found.
                </Text>
              )
            }
          />
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={galleryItems}
          keyExtractor={item => String(item.id)}
          renderItem={renderGalleryItem}
          numColumns={COLUMN_COUNT}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>
              {selectedLocation} ›{' '}
              {selectedCategory === 'All' ? 'All' : selectedCategory}
            </Text>
          }
          ListFooterComponent={
            loadingMore && (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )
          }
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>
                No images found.
              </Text>
            )
          }
        />
        {loading && (
          <View style={[styles.loaderOverlay, { top: verticalScale(80) }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {viewMode === 'folders'
            ? 'Project Gallery'
            : viewMode === 'subfolders'
            ? selectedLocation
            : selectedCategory}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {renderContent()}

      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: getImageUrl(selectedImage.imageUrl) }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalFooter}>
                <Text style={styles.modalTitle}>{selectedImage.title}</Text>
                <Text style={styles.modalCategory}>
                  {selectedImage.category}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(10),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
    zIndex: 1,
  },
  backButton: {
    padding: moderateScale(8),
  },
  backButtonText: {
    fontSize: moderateScale(24),
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: moderateScale(FONTS.sizes.h3),
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionLabel: {
    fontSize: moderateScale(FONTS.sizes.small),
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: moderateScale(20),
    marginVertical: verticalScale(16),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  folderContainer: {
    width: ITEM_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    alignItems: 'center',
    ...SHADOWS.small,
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  folderIconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: '#F0F7FF',
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  folderIcon: {
    fontSize: moderateScale(30),
  },
  folderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(10),
    minWidth: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  folderBadgeText: {
    color: COLORS.white,
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  folderName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(40),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: moderateScale(8),
  },
  itemTitle: {
    fontSize: moderateScale(FONTS.sizes.small),
    color: COLORS.white,
    fontWeight: '700',
  },
  itemCategory: {
    fontSize: moderateScale(FONTS.sizes.caption),
    color: 'rgba(255,255,255,0.8)',
    marginTop: verticalScale(2),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: verticalScale(40),
    right: moderateScale(20),
    padding: moderateScale(10),
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: moderateScale(30),
    color: COLORS.white,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: width * 1.2,
    maxWidth: 600,
    maxHeight: 600,
  },
  modalFooter: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(FONTS.sizes.h2),
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalCategory: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.primary,
    marginTop: verticalScale(8),
  },
});

export default ClientGalleryScreen;
