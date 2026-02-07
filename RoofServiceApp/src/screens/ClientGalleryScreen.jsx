import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

// Local assets - make sure these exist in your assets folder or adjust paths
const GALLERY_ITEMS = [
  {
    id: '1',
    category: 'Shingle',
    title: 'Project 1: New Setup',
    image: require('../../assets/project-1.jpg'),
  },
  {
    id: '2',
    category: 'Metal',
    title: 'Project 2: Metal Works',
    image: require('../../assets/project-2.jpg'),
  },
  {
    id: '3',
    category: 'Repair',
    title: 'Project 3: Detailed Repair',
    image: require('../../assets/project-3.jpg'),
  },
  {
    id: '4',
    category: 'Flat',
    title: 'Project 4: Commercial',
    image: require('../../assets/project-4.jpg'),
  },
  {
    id: '5',
    category: 'Shingle',
    title: 'Project 5: Restoration',
    image: require('../../assets/project-5.jpg'),
  },
  {
    id: '6',
    category: 'Gutters',
    title: 'Project 6: Gutter System',
    image: require('../../assets/project-6.jpg'),
  },
   {
    id: '7',
    category: 'Shingle',
    title: 'Asphalt Shingle View',
    image: require('../../assets/asphalt-shingles.jpg'),
  },
  {
    id: '8',
    category: 'Metal',
    title: 'Metal Roofing Finish',
    image: require('../../assets/Metal-Roofing-New.jpg'),
  },
  {
    id: '9',
    category: 'Flat',
    title: 'Flat Roof Installation',
    image: require('../../assets/flat-roofing.jpg'),
  },
  {
    id: '10',
    category: 'Repair',
    title: 'Roof Repair Job',
    image: require('../../assets/Repai.jpg'),
  },
];

const CATEGORIES = ['All', 'Shingle', 'Metal', 'Flat', 'Repair', 'Gutters'];

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - moderateScale(60)) / COLUMN_COUNT;

const ClientGalleryScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredItems =
    selectedCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedImage(item)}
    >
      <Image
        source={item.image}
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

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.categoryTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Gallery</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          renderItem={renderCategoryItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderGalleryItem}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
                source={selectedImage.image}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalFooter}>
                <Text style={styles.modalTitle}>{selectedImage.title}</Text>
                <Text style={styles.modalCategory}>{selectedImage.category}</Text>
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
  categoryContainer: {
    marginVertical: verticalScale(16),
  },
  categoryList: {
    paddingHorizontal: moderateScale(20),
    paddingRight: moderateScale(40),
  },
  categoryChip: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.white,
    marginRight: moderateScale(10),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: moderateScale(FONTS.sizes.small),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
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
