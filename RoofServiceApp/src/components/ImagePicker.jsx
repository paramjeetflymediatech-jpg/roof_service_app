import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, Alert, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../utils/constants';

const ImagePickerComponent = ({ images, onImagesChange, maxImages = 5 }) => {
  const handlePickImages = async () => {
    const result = await launchImageLibrary({
      selectionLimit: maxImages - images.length,
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type,
      }));
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Images ({images.length}/{maxImages})</Text>
      <View style={styles.imageGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < maxImages && (
          <TouchableOpacity style={styles.addButton} onPress={handlePickImages}>
            <Text style={styles.addButtonText}>+</Text>
            <Text style={styles.addButtonLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  addButtonLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});

export default ImagePickerComponent;
